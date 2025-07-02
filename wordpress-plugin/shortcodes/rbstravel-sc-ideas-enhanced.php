<?php
namespace RBS_TRAVEL\SHORTCODES;
defined('RBS_TRAVEL') or die();

/**
 * Enhanced Ideas Shortcode
 * Usage: [rbstravel_ideas_enhanced microsite="rondreis-planner"]
 */

function rbstravel_ideas_enhanced_shortcode($atts) {
    $atts = shortcode_atts(array(
        'microsite' => 'rondreis-planner',
        'show_search' => 'true',
        'show_browse' => 'true', 
        'show_high_ids' => 'true',
        'limit' => '10'
    ), $atts);
    
    // Enqueue necessary scripts if not already done
    wp_enqueue_script('jquery');
    
    ob_start();
    ?>
    <div id="rbstravel-ideas-enhanced" class="rbstravel-ideas-container" 
         data-microsite="<?php echo esc_attr($atts['microsite']); ?>"
         data-limit="<?php echo esc_attr($atts['limit']); ?>">
        
        <div class="rbstravel-section-header">
            <h3>🌍 Travel Ideas Verkennen</h3>
            <p>Ontdek reisideeën uit Travel Compositor</p>
        </div>
        
        <div class="rbstravel-ideas-controls">
            <div class="rbstravel-control-group">
                <label for="rbstravel-microsite-select">Microsite:</label>
                <select id="rbstravel-microsite-select" class="rbstravel-select">
                    <option value="rondreis-planner" <?php selected($atts['microsite'], 'rondreis-planner'); ?>>Rondreis Planner</option>
                    <option value="reisbureaunederland">Reisbureau Nederland</option>
                    <option value="auto">Auto Microsite</option>
                    <option value="microsite-4">Microsite 4</option>
                </select>
            </div>
            
            <div class="rbstravel-control-group">
                <label for="rbstravel-idea-id">Idea ID:</label>
                <input type="text" id="rbstravel-idea-id" class="rbstravel-input" placeholder="bijv. 24926536">
            </div>
            
            <div class="rbstravel-button-group">
                <?php if ($atts['show_search'] === 'true'): ?>
                <button id="rbstravel-search-idea" class="rbstravel-btn rbstravel-btn-primary">
                    🔍 Zoek Idea
                </button>
                <?php endif; ?>
                
                <?php if ($atts['show_browse'] === 'true'): ?>
                <button id="rbstravel-browse-ideas" class="rbstravel-btn rbstravel-btn-secondary">
                    📋 Browse Ideas
                </button>
                <?php endif; ?>
                
                <?php if ($atts['show_high_ids'] === 'true'): ?>
                <button id="rbstravel-search-high-ids" class="rbstravel-btn rbstravel-btn-accent">
                    🔢 Zoek Hoge ID's
                </button>
                <?php endif; ?>
            </div>
        </div>
        
        <div id="rbstravel-ideas-results" class="rbstravel-ideas-results" style="display: none;">
            <!-- Results will be loaded here -->
        </div>
        
        <div id="rbstravel-idea-preview" class="rbstravel-idea-preview" style="display: none;">
            <!-- Selected idea preview -->
        </div>
        
        <!-- Loading States -->
        <div id="rbstravel-loading" class="rbstravel-loading" style="display: none;">
            <div class="rbstravel-spinner"></div>
            <span>Laden...</span>
        </div>
    </div>
    
    <style>
    .rbstravel-ideas-container {
        max-width: 1200px;
        margin: 20px auto;
        padding: 20px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .rbstravel-section-header h3 {
        color: #2c3e50;
        margin-bottom: 5px;
    }
    
    .rbstravel-section-header p {
        color: #7f8c8d;
        margin-bottom: 20px;
    }
    
    .rbstravel-ideas-controls {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        margin-bottom: 20px;
        align-items: end;
    }
    
    .rbstravel-control-group {
        display: flex;
        flex-direction: column;
        min-width: 200px;
    }
    
    .rbstravel-control-group label {
        font-weight: 600;
        margin-bottom: 5px;
        color: #34495e;
    }
    
    .rbstravel-select, .rbstravel-input {
        padding: 10px;
        border: 2px solid #e0e0e0;
        border-radius: 5px;
        font-size: 14px;
    }
    
    .rbstravel-select:focus, .rbstravel-input:focus {
        outline: none;
        border-color: #3498db;
    }
    
    .rbstravel-button-group {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }
    
    .rbstravel-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s ease;
    }
    
    .rbstravel-btn-primary {
        background: #3498db;
        color: white;
    }
    
    .rbstravel-btn-primary:hover {
        background: #2980b9;
    }
    
    .rbstravel-btn-secondary {
        background: #95a5a6;
        color: white;
    }
    
    .rbstravel-btn-secondary:hover {
        background: #7f8c8d;
    }
    
    .rbstravel-btn-accent {
        background: #e74c3c;
        color: white;
    }
    
    .rbstravel-btn-accent:hover {
        background: #c0392b;
    }
    
    .rbstravel-ideas-results {
        margin-top: 20px;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
    }
    
    .rbstravel-idea-card {
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 15px;
        background: #f8f9fa;
    }
    
    .rbstravel-idea-card h4 {
        color: #2c3e50;
        margin-bottom: 10px;
    }
    
    .rbstravel-idea-card p {
        color: #7f8c8d;
        font-size: 14px;
        margin-bottom: 10px;
    }
    
    .rbstravel-idea-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 10px;
    }
    
    .rbstravel-idea-price {
        font-weight: bold;
        color: #27ae60;
    }
    
    .rbstravel-loading {
        text-align: center;
        padding: 20px;
    }
    
    .rbstravel-spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        animation: spin 1s linear infinite;
        margin: 0 auto 10px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .rbstravel-error {
        background: #e74c3c;
        color: white;
        padding: 10px;
        border-radius: 5px;
        margin: 10px 0;
    }
    
    .rbstravel-success {
        background: #27ae60;
        color: white;
        padding: 10px;
        border-radius: 5px;
        margin: 10px 0;
    }
    </style>
    
    <script>
    jQuery(document).ready(function($) {
        const container = $('#rbstravel-ideas-enhanced');
        const resultsContainer = $('#rbstravel-ideas-results');
        const loadingDiv = $('#rbstravel-loading');
        
        function showLoading() {
            loadingDiv.show();
            resultsContainer.hide();
        }
        
        function hideLoading() {
            loadingDiv.hide();
        }
        
        function showError(message) {
            resultsContainer.html('<div class="rbstravel-error">' + message + '</div>').show();
        }
        
        function showSuccess(message) {
            resultsContainer.html('<div class="rbstravel-success">' + message + '</div>').show();
        }
        
        // Search specific idea
        $('#rbstravel-search-idea').click(function() {
            const ideaId = $('#rbstravel-idea-id').val().trim();
            const micrositeId = $('#rbstravel-microsite-select').val();
            
            if (!ideaId) {
                alert('Voer een Idea ID in');
                return;
            }
            
            showLoading();
            
            $.ajax({
                url: rbsTravel.ajax_url,
                type: 'POST',
                data: {
                    action: 'rbstravel_search_ideas',
                    nonce: rbsTravel.nonce,
                    idea_id: ideaId,
                    microsite_id: micrositeId
                },
                success: function(response) {
                    hideLoading();
                    if (response.success) {
                        displayIdeas([response.data.idea[0]]);
                        showSuccess('Idea gevonden! Data wordt verwerkt...');
                    } else {
                        showError(response.data || 'Idea niet gevonden');
                    }
                },
                error: function() {
                    hideLoading();
                    showError('Er is een fout opgetreden bij het zoeken');
                }
            });
        });
        
        // Browse ideas
        $('#rbstravel-browse-ideas').click(function() {
            const micrositeId = $('#rbstravel-microsite-select').val();
            const limit = container.data('limit');
            
            showLoading();
            
            $.ajax({
                url: rbsTravel.ajax_url,
                type: 'POST',
                data: {
                    action: 'rbstravel_browse_ideas',
                    nonce: rbsTravel.nonce,
                    microsite_id: micrositeId,
                    first: 0,
                    limit: limit
                },
                success: function(response) {
                    hideLoading();
                    if (response.success && response.data.idea) {
                        displayIdeas(response.data.idea);
                    } else {
                        showError('Geen ideas gevonden');
                    }
                },
                error: function() {
                    hideLoading();
                    showError('Er is een fout opgetreden bij het browsen');
                }
            });
        });
        
        // Search high IDs
        $('#rbstravel-search-high-ids').click(function() {
            const micrositeId = $('#rbstravel-microsite-select').val();
            
            showLoading();
            
            $.ajax({
                url: rbsTravel.ajax_url,
                type: 'POST',
                data: {
                    action: 'rbstravel_search_high_ids',
                    nonce: rbsTravel.nonce,
                    microsite_id: micrositeId
                },
                success: function(response) {
                    hideLoading();
                    if (response.success) {
                        displayFoundIds(response.data);
                        showSuccess('Hoge ID\'s gevonden!');
                    } else {
                        showError(response.data || 'Geen geldige hoge ID\'s gevonden');
                    }
                },
                error: function() {
                    hideLoading();
                    showError('Er is een fout opgetreden bij het zoeken naar hoge ID\'s');
                }
            });
        });
        
        function displayIdeas(ideas) {
            let html = '';
            
            ideas.forEach(function(idea) {
                if (idea) {
                    const title = idea.title || 'Untitled Idea';
                    const description = idea.description || 'Geen beschrijving beschikbaar';
                    const destinations = idea.destinations ? idea.destinations.join(', ') : 'Onbekend';
                    const price = idea.totalPrice ? 
                        '€' + idea.totalPrice.amount + ' ' + idea.totalPrice.currency : 
                        'Prijs op aanvraag';
                    
                    html += `
                        <div class="rbstravel-idea-card">
                            <h4>${title}</h4>
                            <p><strong>Bestemmingen:</strong> ${destinations}</p>
                            <p>${description.substring(0, 150)}${description.length > 150 ? '...' : ''}</p>
                            <div class="rbstravel-idea-meta">
                                <span class="rbstravel-idea-price">${price}</span>
                                <button class="rbstravel-btn rbstravel-btn-primary" onclick="viewIdeaDetails(${idea.id})">
                                    Bekijk Details
                                </button>
                            </div>
                        </div>
                    `;
                }
            });
            
            resultsContainer.html(html).show();
        }
        
        function displayFoundIds(foundIds) {
            let html = '<h4>Gevonden Hoge ID\'s:</h4>';
            
            foundIds.forEach(function(item) {
                html += `
                    <div class="rbstravel-idea-card">
                        <h4>Idea ${item.id}</h4>
                        <p><strong>Titel:</strong> ${item.title}</p>
                        <p>${item.description}</p>
                        <div class="rbstravel-idea-meta">
                            <span>ID: ${item.id}</span>
                            <button class="rbstravel-btn rbstravel-btn-primary" onclick="loadIdeaById(${item.id})">
                                Laden
                            </button>
                        </div>
                    </div>
                `;
            });
            
            resultsContainer.html(html).show();
        }
        
        // Global functions for button clicks
        window.viewIdeaDetails = function(ideaId) {
            $('#rbstravel-idea-id').val(ideaId);
            $('#rbstravel-search-idea').click();
        };
        
        window.loadIdeaById = function(ideaId) {
            $('#rbstravel-idea-id').val(ideaId);
            $('#rbstravel-search-idea').click();
        };
    });
    </script>
    <?php
    return ob_get_clean();
}

add_shortcode('rbstravel_ideas_enhanced', 'rbstravel_ideas_enhanced_shortcode');
?>
