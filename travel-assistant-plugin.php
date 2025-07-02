<?php
/**
 * Plugin Name: Travel Assistant
 * Description: AI-powered travel assistant with document upload and chat functionality
 * Version: 1.0.0
 * Author: Your Name
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('TRAVEL_ASSISTANT_PLUGIN_URL', plugin_dir_url(__FILE__));
define('TRAVEL_ASSISTANT_PLUGIN_PATH', plugin_dir_path(__FILE__));

class TravelAssistantPlugin {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_shortcode('travel_assistant', array($this, 'render_travel_assistant'));
        
        // AJAX handlers
        add_action('wp_ajax_upload_document', array($this, 'handle_document_upload'));
        add_action('wp_ajax_nopriv_upload_document', array($this, 'handle_document_upload'));
        add_action('wp_ajax_save_intake', array($this, 'handle_intake_save'));
        add_action('wp_ajax_nopriv_save_intake', array($this, 'handle_intake_save'));
        add_action('wp_ajax_chat_message', array($this, 'handle_chat_message'));
        add_action('wp_ajax_nopriv_chat_message', array($this, 'handle_chat_message'));
        add_action('wp_ajax_travel_assistant_search_idea', array($this, 'search_idea'));
        add_action('wp_ajax_nopriv_travel_assistant_search_idea', array($this, 'search_idea'));
        add_action('wp_ajax_travel_assistant_browse_ideas', array($this, 'browse_ideas'));
        add_action('wp_ajax_nopriv_travel_assistant_browse_ideas', array($this, 'browse_ideas'));
        add_action('wp_ajax_travel_assistant_search_high_ids', array($this, 'search_high_ids'));
        add_action('wp_ajax_nopriv_travel_assistant_search_high_ids', array($this, 'search_high_ids'));
        add_action('wp_ajax_travel_assistant_upload_file', array($this, 'upload_file'));
        add_action('wp_ajax_nopriv_travel_assistant_upload_file', array($this, 'upload_file'));
        add_action('wp_ajax_travel_assistant_chat', array($this, 'chat'));
        add_action('wp_ajax_nopriv_travel_assistant_chat', array($this, 'chat'));
    }
    
    public function init() {
        $this->create_database_tables();
    }
    
    public function enqueue_scripts() {
        wp_enqueue_script('travel-assistant-js', TRAVEL_ASSISTANT_PLUGIN_URL . 'assets/travel-assistant.js', array('jquery'), '1.0.0', true);
        wp_enqueue_style('travel-assistant-css', TRAVEL_ASSISTANT_PLUGIN_URL . 'assets/travel-assistant.css', array(), '1.0.0');
        
        // Localize script for AJAX
        wp_localize_script('travel-assistant-js', 'travel_assistant_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('travel_assistant_nonce')
        ));
    }
    
    public function create_database_tables() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // Users table
        $users_table = $wpdb->prefix . 'travel_users';
        $users_sql = "CREATE TABLE $users_table (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            name varchar(100) NOT NULL,
            email varchar(100) NOT NULL,
            phone varchar(20),
            preferences text,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";
        
        // Documents table
        $documents_table = $wpdb->prefix . 'travel_documents';
        $documents_sql = "CREATE TABLE $documents_table (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            user_id mediumint(9) NOT NULL,
            filename varchar(255) NOT NULL,
            file_path varchar(500) NOT NULL,
            file_type varchar(50) NOT NULL,
            file_size int NOT NULL,
            upload_date datetime DEFAULT CURRENT_TIMESTAMP,
            processed tinyint(1) DEFAULT 0,
            content text,
            PRIMARY KEY (id)
        ) $charset_collate;";
        
        // Chat history table
        $chat_table = $wpdb->prefix . 'travel_chat_history';
        $chat_sql = "CREATE TABLE $chat_table (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            user_id mediumint(9) NOT NULL,
            message text NOT NULL,
            response text NOT NULL,
            timestamp datetime DEFAULT CURRENT_TIMESTAMP,
            session_id varchar(100),
            PRIMARY KEY (id)
        ) $charset_collate;";
        
        // Travel ideas table - NEW for Ideas integration
        $ideas_table = $wpdb->prefix . 'travel_ideas';
        $ideas_sql = "CREATE TABLE $ideas_table (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            user_id mediumint(9) NOT NULL,
            idea_id varchar(50) NOT NULL,
            microsite_id varchar(50) NOT NULL,
            title varchar(255),
            description text,
            destinations text,
            start_date date,
            end_date date,
            total_price decimal(10,2),
            currency varchar(10),
            status varchar(50) DEFAULT 'draft',
            services_data longtext,
            images_data text,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY unique_idea (idea_id, microsite_id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($users_sql);
        dbDelta($documents_sql);
        dbDelta($chat_sql);
        dbDelta($ideas_sql);
    }
    
    public function render_travel_assistant($atts) {
        $atts = shortcode_atts(array(
            'mode' => 'full', // full, chat-only, upload-only, ideas-only
            'microsite' => 'rondreis-planner',
            'show_ideas' => 'true'
        ), $atts);
        
        ob_start();
        ?>
        <div id="travel-assistant-container" data-mode="<?php echo esc_attr($atts['mode']); ?>" data-microsite="<?php echo esc_attr($atts['microsite']); ?>">
            
            <?php if ($atts['mode'] === 'full' || $atts['mode'] === 'ideas-only'): ?>
            <!-- Travel Ideas Section -->
            <div class="travel-ideas-section">
                <h3>🌍 Reisideeën Verkennen</h3>
                <div class="ideas-controls">
                    <div class="microsite-selector">
                        <label for="microsite-select">Microsite:</label>
                        <select id="microsite-select">
                            <option value="rondreis-planner">Rondreis Planner</option>
                            <option value="reisbureaunederland">Reisbureau Nederland</option>
                            <option value="auto">Auto Microsite</option>
                            <option value="microsite-4">Microsite 4</option>
                        </select>
                    </div>
                    <div class="idea-search">
                        <input type="text" id="idea-id-input" placeholder="Idea ID (bijv. 24926536)">
                        <button id="search-idea-btn">🔍 Zoek Idea</button>
                        <button id="browse-ideas-btn">📋 Browse Ideas</button>
                        <button id="search-high-ids-btn">🔢 Zoek Hoge ID's</button>
                    </div>
                </div>
                
                <div id="ideas-results" class="ideas-results" style="display: none;">
                    <!-- Ideas will be loaded here -->
                </div>
                
                <div id="idea-preview" class="idea-preview" style="display: none;">
                    <!-- Selected idea preview will be shown here -->
                </div>
            </div>
            <?php endif; ?>
            
            <?php if ($atts['mode'] === 'full' || $atts['mode'] === 'upload-only'): ?>
            <!-- Document Upload Section -->
            <div class="upload-section">
                <h3>📄 Documenten Uploaden</h3>
                <div class="upload-area" id="upload-area">
                    <div class="upload-content">
                        <div class="upload-icon">📁</div>
                        <p>Sleep bestanden hierheen of klik om te selecteren</p>
                        <p class="upload-hint">Ondersteunde formaten: PDF, DOC, DOCX, TXT, JPG, PNG</p>
                    </div>
                    <input type="file" id="file-input" multiple accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png">
                </div>
                
                <div id="file-list" class="file-list"></div>
                <button id="upload-btn" class="upload-btn" style="display: none;">Upload Bestanden</button>
            </div>
            <?php endif; ?>
            
            <?php if ($atts['mode'] === 'full' || $atts['mode'] === 'chat-only'): ?>
            <!-- Chat Interface Section -->
            <div class="chat-section">
                <h3>💬 AI Reisassistent</h3>
                <div id="chat-container" class="chat-container">
                    <div id="chat-messages" class="chat-messages">
                        <div class="message assistant-message">
                            <div class="message-content">
                                <p>Hallo! Ik ben je AI reisassistent. Ik kan je helpen met:</p>
                                <ul>
                                    <li>🌍 Reisideeën verkennen uit Travel Compositor</li>
                                    <li>📄 Je reisdocumenten analyseren</li>
                                    <li>✈️ Reisadvies en planning</li>
                                    <li>🏨 Hotel en activiteiten aanbevelingen</li>
                                </ul>
                                <p>Upload je documenten of verken reisideeën om te beginnen!</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="chat-input-container">
                        <div class="chat-input-wrapper">
                            <textarea id="chat-input" placeholder="Stel je vraag over reizen..." rows="2"></textarea>
                            <button id="send-btn" class="send-btn">
                                <span class="send-icon">➤</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <?php endif; ?>
            
            <!-- Loading overlay -->
            <div id="loading-overlay" class="loading-overlay" style="display: none;">
                <div class="loading-spinner"></div>
                <p>Verwerken...</p>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    private function get_or_create_session() {
        if (!session_id()) {
            session_start();
        }
        
        if (!isset($_SESSION['travel_assistant_session'])) {
            $_SESSION['travel_assistant_session'] = uniqid('ta_', true);
        }
        
        return $_SESSION['travel_assistant_session'];
    }
    
    public function handle_document_upload() {
        check_ajax_referer('travel_assistant_nonce', 'nonce');
        
        if (!isset($_FILES['file'])) {
            wp_die('Geen bestand ontvangen');
        }
        
        $file = $_FILES['file'];
        $upload_dir = wp_upload_dir();
        $travel_dir = $upload_dir['basedir'] . '/travel-assistant/';
        
        if (!file_exists($travel_dir)) {
            wp_mkdir_p($travel_dir);
        }
        
        $filename = sanitize_file_name($file['name']);
        $filepath = $travel_dir . $filename;
        
        if (move_uploaded_file($file['tmp_name'], $filepath)) {
            $file_url = $upload_dir['baseurl'] . '/travel-assistant/' . $filename;
            
            wp_send_json_success(array(
                'url' => $file_url,
                'name' => $filename,
                'size' => $file['size']
            ));
        } else {
            wp_send_json_error('Upload mislukt');
        }
    }
    
    public function handle_intake_save() {
        check_ajax_referer('travel_assistant_nonce', 'nonce');
        
        $session_id = sanitize_text_field($_POST['session_id']);
        $intake_data = $_POST['intake_data'];
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'travel_sessions';
        
        $result = $wpdb->replace(
            $table_name,
            array(
                'session_id' => $session_id,
                'user_data' => json_encode($intake_data)
            ),
            array('%s', '%s')
        );
        
        if ($result !== false) {
            wp_send_json_success('Data opgeslagen');
        } else {
            wp_send_json_error('Opslaan mislukt');
        }
    }
    
    public function handle_chat_message() {
        check_ajax_referer('travel_assistant_nonce', 'nonce');
        
        $message = sanitize_text_field($_POST['message']);
        $session_id = sanitize_text_field($_POST['session_id']);
        
        // Get user data and documents
        global $wpdb;
        $table_name = $wpdb->prefix . 'travel_sessions';
        $session_data = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table_name WHERE session_id = %s",
            $session_id
        ));
        
        if (!$session_data) {
            wp_send_json_error('Sessie niet gevonden');
            return;
        }
        
        $user_data = json_decode($session_data->user_data, true);
        $chat_history = json_decode($session_data->chat_history, true) ?: array();
        
        // Add user message to history
        $chat_history[] = array(
            'role' => 'user',
            'content' => $message,
            'timestamp' => current_time('mysql')
        );
        
        // Call OpenAI API
        $response = $this->call_openai_api($message, $user_data, $chat_history);
        
        if ($response) {
            // Add assistant response to history
            $chat_history[] = array(
                'role' => 'assistant',
                'content' => $response,
                'timestamp' => current_time('mysql')
            );
            
            // Update database
            $wpdb->update(
                $table_name,
                array('chat_history' => json_encode($chat_history)),
                array('session_id' => $session_id),
                array('%s'),
                array('%s')
            );
            
            wp_send_json_success(array('response' => $response));
        } else {
            wp_send_json_error('AI antwoord mislukt');
        }
    }
    
    private function call_openai_api($message, $user_data, $chat_history) {
        $api_key = get_option('travel_assistant_openai_key');
        if (!$api_key) {
            return 'OpenAI API key niet geconfigureerd.';
        }
        
        // Create system prompt
        $system_prompt = $this->create_system_prompt($user_data);
        
        // Prepare messages for API
        $messages = array(
            array('role' => 'system', 'content' => $system_prompt)
        );
        
        // Add recent chat history (last 10 messages)
        $recent_history = array_slice($chat_history, -10);
        foreach ($recent_history as $msg) {
            $messages[] = array(
                'role' => $msg['role'],
                'content' => $msg['content']
            );
        }
        
        $data = array(
            'model' => 'gpt-4o-mini',
            'messages' => $messages,
            'max_tokens' => 500,
            'temperature' => 0.7
        );
        
        $response = wp_remote_post('https://api.openai.com/v1/chat/completions', array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type' => 'application/json'
            ),
            'body' => json_encode($data),
            'timeout' => 30
        ));
        
        if (is_wp_error($response)) {
            return false;
        }
        
        $body = wp_remote_retrieve_body($response);
        $result = json_decode($body, true);
        
        if (isset($result['choices'][0]['message']['content'])) {
            return $result['choices'][0]['message']['content'];
        }
        
        return false;
    }
    
    private function create_system_prompt($user_data) {
        $naam = $user_data['naam'] ?? 'Reiziger';
        $reisgenoten = $user_data['reisgenoten'] ?? 'Onbekend';
        $interesses = isset($user_data['interesses']) ? implode(', ', $user_data['interesses']) : 'Geen opgegeven';
        $budget = $user_data['budget'] ?? 'Onbekend';
        $reisstijl = $user_data['reisstijl'] ?? 'Onbekend';
        
        return "Je bent een persoonlijke reis-assistent voor {$naam}.

REIZIGER INFORMATIE:
- Naam: {$naam}
- Reisgenoten: {$reisgenoten}
- Interesses: {$interesses}
- Budget: {$budget}
- Reisstijl: {$reisstijl}

Geef persoonlijke, relevante reisadviezen in het Nederlands. Wees vriendelijk en behulpzaam.";
    }
    
    public function search_idea() {
        check_ajax_referer('travel_assistant_nonce', 'nonce');
        
        $idea_id = sanitize_text_field($_POST['idea_id']);
        $microsite = sanitize_text_field($_POST['microsite']);
        
        // Call your Next.js API endpoint
        $api_url = get_option('travel_assistant_api_url', 'http://localhost:3000');
        $response = wp_remote_get($api_url . "/api/travel-compositor/idea/{$microsite}/{$idea_id}");
        
        if (is_wp_error($response)) {
            wp_send_json_error('API call failed');
            return;
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if ($data['success']) {
            // Store idea in database
            global $wpdb;
            $ideas_table = $wpdb->prefix . 'travel_ideas';
            
            $idea_data = $data['idea'];
            $wpdb->replace($ideas_table, array(
                'user_id' => get_current_user_id(),
                'idea_id' => $idea_id,
                'microsite_id' => $microsite,
                'title' => $idea_data['title'] ?? '',
                'description' => $idea_data['description'] ?? '',
                'destinations' => json_encode($idea_data['destinations'] ?? []),
                'start_date' => $idea_data['startDate'] ?? null,
                'end_date' => $idea_data['endDate'] ?? null,
                'total_price' => $idea_data['totalPrice']['amount'] ?? 0,
                'currency' => $idea_data['totalPrice']['currency'] ?? 'EUR',
                'services_data' => json_encode($idea_data),
                'images_data' => json_encode($idea_data['images'] ?? [])
            ));
            
            wp_send_json_success($data);
        } else {
            wp_send_json_error($data['error']);
        }
    }
    
    public function browse_ideas() {
        check_ajax_referer('travel_assistant_nonce', 'nonce');
        
        $microsite = sanitize_text_field($_POST['microsite']);
        
        // Call your Next.js API endpoint
        $api_url = get_option('travel_assistant_api_url', 'http://localhost:3000');
        $response = wp_remote_get($api_url . "/api/travel-compositor/ideas/{$microsite}");
        
        if (is_wp_error($response)) {
            wp_send_json_error('API call failed');
            return;
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        wp_send_json_success($data);
    }
    
    public function search_high_ids() {
        check_ajax_referer('travel_assistant_nonce', 'nonce');
        
        $microsite = sanitize_text_field($_POST['microsite']);
        
        // This would call a special endpoint that implements the high ID search logic
        $api_url = get_option('travel_assistant_api_url', 'http://localhost:3000');
        $response = wp_remote_get($api_url . "/api/travel-compositor/search-high-ids/{$microsite}");
        
        if (is_wp_error($response)) {
            wp_send_json_error('API call failed');
            return;
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        wp_send_json_success($data);
    }
    
    public function upload_file() {
        check_ajax_referer('travel_assistant_nonce', 'nonce');
        
        if (!isset($_FILES['files'])) {
            wp_send_json_error('No files uploaded');
            return;
        }
        
        $uploaded_files = array();
        $files = $_FILES['files'];
        
        for ($i = 0; $i < count($files['name']); $i++) {
            if ($files['error'][$i] === UPLOAD_ERR_OK) {
                $upload = wp_handle_upload(array(
                    'name' => $files['name'][$i],
                    'type' => $files['type'][$i],
                    'tmp_name' => $files['tmp_name'][$i],
                    'error' => $files['error'][$i],
                    'size' => $files['size'][$i]
                ), array('test_form' => false));
                
                if (!isset($upload['error'])) {
                    // Store file info in database
                    global $wpdb;
                    $documents_table = $wpdb->prefix . 'travel_documents';
                    
                    $wpdb->insert($documents_table, array(
                        'user_id' => get_current_user_id(),
                        'filename' => $files['name'][$i],
                        'file_path' => $upload['file'],
                        'file_type' => $files['type'][$i],
                        'file_size' => $files['size'][$i]
                    ));
                    
                    $uploaded_files[] = array(
                        'id' => $wpdb->insert_id,
                        'filename' => $files['name'][$i],
                        'url' => $upload['url']
                    );
                }
            }
        }
        
        wp_send_json_success($uploaded_files);
    }
    
    public function chat() {
        check_ajax_referer('travel_assistant_nonce', 'nonce');
        
        $message = sanitize_textarea_field($_POST['message']);
        $session_id = sanitize_text_field($_POST['session_id']);
        
        // Get user's uploaded documents and ideas for context
        global $wpdb;
        $user_id = get_current_user_id();
        
        $documents = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}travel_documents WHERE user_id = %d ORDER BY upload_date DESC LIMIT 10",
            $user_id
        ));
        
        $ideas = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}travel_ideas WHERE user_id = %d ORDER BY created_at DESC LIMIT 5",
            $user_id
        ));
        
        // Prepare context for AI
        $context = array(
            'documents' => $documents,
            'ideas' => $ideas,
            'message' => $message
        );
        
        // Call your Next.js API endpoint for AI chat
        $api_url = get_option('travel_assistant_api_url', 'http://localhost:3000');
        $response = wp_remote_post($api_url . '/api/chat', array(
            'body' => json_encode($context),
            'headers' => array('Content-Type' => 'application/json')
        ));
        
        if (is_wp_error($response)) {
            wp_send_json_error('AI service unavailable');
            return;
        }
        
        $body = wp_remote_retrieve_body($response);
        $ai_response = json_decode($body, true);
        
        // Store chat history
        $chat_table = $wpdb->prefix . 'travel_chat_history';
        $wpdb->insert($chat_table, array(
            'user_id' => $user_id,
            'message' => $message,
            'response' => $ai_response['response'],
            'session_id' => $session_id
        ));
        
        wp_send_json_success($ai_response);
    }
}

// Initialize the plugin
new TravelAssistantPlugin();

// Admin menu
function travel_assistant_admin_menu() {
    add_menu_page(
        'Travel Assistant',
        'Travel Assistant',
        'manage_options',
        'travel-assistant',
        'travel_assistant_admin_page',
        'dashicons-airplane',
        30
    );
}
add_action('admin_menu', 'travel_assistant_admin_menu');

// Admin page
function travel_assistant_admin_page() {
    if (isset($_POST['save_settings'])) {
        update_option('travel_assistant_api_url', sanitize_url($_POST['api_url']));
        update_option('travel_assistant_openai_key', sanitize_text_field($_POST['openai_key']));
        echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
    }
    
    $api_url = get_option('travel_assistant_api_url', 'http://localhost:3000');
    $openai_key = get_option('travel_assistant_openai_key', '');
    ?>
    <div class="wrap">
        <h1>Travel Assistant Settings</h1>
        
        <form method="post">
            <table class="form-table">
                <tr>
                    <th scope="row">API URL</th>
                    <td>
                        <input type="url" name="api_url" value="<?php echo esc_attr($api_url); ?>" class="regular-text" />
                        <p class="description">URL of your Next.js application</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">OpenAI API Key</th>
                    <td>
                        <input type="password" name="openai_key" value="<?php echo esc_attr($openai_key); ?>" class="regular-text" />
                        <p class="description">Your OpenAI API key for AI chat functionality</p>
                    </td>
                </tr>
            </table>
            
            <?php submit_button('Save Settings', 'primary', 'save_settings'); ?>
        </form>
        
        <h2>Usage</h2>
        <p>Use the shortcode <code>[travel_assistant]</code> to display the travel assistant interface.</p>
        
        <h3>Shortcode Options:</h3>
        <ul>
            <li><code>[travel_assistant mode="full"]</code> - Full interface with ideas, upload, and chat</li>
            <li><code>[travel_assistant mode="ideas-only"]</code> - Only travel ideas section</li>
            <li><code>[travel_assistant mode="chat-only"]</code> - Only chat interface</li>
            <li><code>[travel_assistant mode="upload-only"]</code> - Only document upload</li>
            <li><code>[travel_assistant microsite="rondreis-planner"]</code> - Set default microsite</li>
        </ul>
        
        <h2>Database Statistics</h2>
        <?php
        global $wpdb;
        $users_count = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}travel_users");
        $documents_count = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}travel_documents");
        $ideas_count = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}travel_ideas");
        $chats_count = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}travel_chat_history");
        ?>
        <table class="wp-list-table widefat fixed striped">
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Count</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>Users</td><td><?php echo $users_count; ?></td></tr>
                <tr><td>Documents</td><td><?php echo $documents_count; ?></td></tr>
                <tr><td>Travel Ideas</td><td><?php echo $ideas_count; ?></td></tr>
                <tr><td>Chat Messages</td><td><?php echo $chats_count; ?></td></tr>
            </tbody>
        </table>
    </div>
    <?php
}

// Add admin styles
function travel_assistant_admin_styles() {
    wp_enqueue_style('travel-assistant-admin', TRAVEL_ASSISTANT_PLUGIN_URL . 'assets/admin.css');
}
add_action('admin_enqueue_scripts', 'travel_assistant_admin_styles');
?>
