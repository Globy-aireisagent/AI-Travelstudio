<?php
/**
 * Enhanced Travel Assistant Shortcode with Ideas
 */

function rbs_travel_assistant_shortcode($atts) {
    $atts = shortcode_atts(array(
        'mode' => 'full', // full, ideas-only, chat-only, upload-only
        'microsite' => 'rondreis-planner',
        'show_search' => 'true',
        'show_browse' => 'true',
        'show_high_ids' => 'true'
    ), $atts);
    
    ob_start();
    ?>
    <div id="rbs-travel-assistant" class="rbs-travel-container" 
         data-mode="<?php echo esc_attr($atts['mode']); ?>" 
         data-microsite="<?php echo esc_attr($atts['microsite']); ?>">
        
        <?php if ($atts['mode'] === 'full' || $atts['mode'] === 'ideas-only'): ?>
        <!-- Ideas Section -->
        <div class="rbs-ideas-section">
            <div class="rbs-section-header">
                <h3>🌍 Travel Ideas Verkennen</h3>
                <p>Ontdek reisideeën uit Travel Compositor</p>
            </div>
            
            <div class="rbs-ideas-controls">
                <div class="rbs-control-group">
                    <label for="rbs-microsite-select">Microsite:</label>
                    <select id="rbs-microsite-select" class="rbs-select">
                        <option value="rondreis-planner" <?php selected($atts['microsite'], 'rondreis-planner'); ?>>Rondreis Planner</option>
                        <option value="reisbureaunederland">Reisbureau Nederland</option>
                        <option value="auto">Auto Microsite</option>
                        <option value="microsite-4">Microsite 4</option>
                    </select>
                </div>
                
                <div class="rbs-control-group">
                    <label for="rbs-idea-id">Idea ID:</label>
                    <input type="text" id="rbs-idea-id" class="rbs-input" placeholder="bijv. 24926536">
                </div>
                
                <div class="rbs-button-group">
                    <?php if ($atts['show_search'] === 'true'): ?>
                    <button id="rbs-search-idea" class="rbs-btn rbs-btn-primary">
                        🔍 Zoek Idea
                    </button>
                    <?php endif; ?>
                    
                    <?php if ($atts['show_browse'] === 'true'): ?>
                    <button id="rbs-browse-ideas" class="rbs-btn rbs-btn-secondary">
                        📋 Browse Ideas
                    </button>
                    <?php endif; ?>
                    
                    <?php if ($atts['show_high_ids'] === 'true'): ?>
                    <button id="rbs-search-high-ids" class="rbs-btn rbs-btn-accent">
                        🔢 Zoek Hoge ID's
                    </button>
                    <?php endif; ?>
                </div>
            </div>
            
            <div id="rbs-ideas-results" class="rbs-ideas-results" style="display: none;">
                <!-- Results will be loaded here -->
            </div>
            
            <div id="rbs-idea-preview" class="rbs-idea-preview" style="display: none;">
                <!-- Selected idea preview -->
            </div>
        </div>
        <?php endif; ?>
        
        <?php if ($atts['mode'] === 'full' || $atts['mode'] === 'chat-only'): ?>
        <!-- Enhanced Chat Section -->
        <div class="rbs-chat-section">
            <div class="rbs-section-header">
                <h3>💬 AI Reisassistent</h3>
                <p>Chat met context van je ideas en documenten</p>
            </div>
            
            <div id="rbs-chat-container" class="rbs-chat-container">
                <div id="rbs-chat-messages" class="rbs-chat-messages">
                    <div class="rbs-message rbs-assistant-message">
                        <div class="rbs-message-content">
                            <p>Hallo! Ik ben je AI reisassistent. Ik kan je helpen met:</p>
                            <ul>
                                <li>🌍 Reisideeën uit Travel Compositor analyseren</li>
                                <li>📄 Je documenten verwerken</li>
                                <li>✈️ Persoonlijk reisadvies geven</li>
                                <li>🏨 Aanbevelingen doen op basis van je voorkeuren</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="rbs-chat-input-container">
                    <textarea id="rbs-chat-input" class="rbs-chat-input" 
                              placeholder="Stel je vraag over reizen..." rows="2"></textarea>
                    <button id="rbs-send-message" class="rbs-btn rbs-btn-primary">
                        Verstuur
                    </button>
                </div>
            </div>
        </div>
        <?php endif; ?>
        
        <!-- Loading States -->
        <div id="rbs-loading" class="rbs-loading" style="display: none;">
            <div class="rbs-spinner"></div>
            <span>Laden...</span>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

add_shortcode('rbs_travel_assistant', 'rbs_travel_assistant_shortcode');
?>
