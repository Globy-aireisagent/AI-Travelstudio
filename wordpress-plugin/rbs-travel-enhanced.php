<?php
/**
 * Plugin Name: RBS Travel Enhanced
 * Description: Enhanced travel assistant with Ideas integration
 * Version: 1.0.0
 * Author: RBS Travel
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Use your existing defines structure but enhanced
define('RBS_TRAVEL', 1);
define('RBS_TRAVEL_VERSION', '1.0.0');

// Plugin Identifier
define('RBS_TRAVEL_PLUGIN_IDENTIFIER', 'rbs-travel-enhanced');

// Define plugin paths (based on your existing structure)
define('RBS_TRAVEL_PLUGIN_PATH', dirname(__FILE__) . DIRECTORY_SEPARATOR);
define('RBS_TRAVEL_PLUGIN_PATH_INCLUDES', RBS_TRAVEL_PLUGIN_PATH . 'includes' . DIRECTORY_SEPARATOR);
define('RBS_TRAVEL_PLUGIN_PATH_OBJECTS', RBS_TRAVEL_PLUGIN_PATH_INCLUDES . 'objects' . DIRECTORY_SEPARATOR);
define('RBS_TRAVEL_PLUGIN_PATH_HELPERS', RBS_TRAVEL_PLUGIN_PATH_INCLUDES . 'helpers' . DIRECTORY_SEPARATOR);
define('RBS_TRAVEL_PLUGIN_PATH_SHORTCODES', RBS_TRAVEL_PLUGIN_PATH_INCLUDES . 'shortcodes' . DIRECTORY_SEPARATOR);
define('RBS_TRAVEL_PLUGIN_PATH_TEMPLATES', RBS_TRAVEL_PLUGIN_PATH . 'templates' . DIRECTORY_SEPARATOR);
define('RBS_TRAVEL_PLUGIN_PATH_ASSETS', RBS_TRAVEL_PLUGIN_PATH . 'assets' . DIRECTORY_SEPARATOR);

// Upload paths
define('RBS_TRAVEL_UPLOADS_PATH', wp_upload_directory());
define('RBS_TRAVEL_UPLOADS_PATH_TMP', RBS_TRAVEL_UPLOADS_PATH . 'tmp' . DIRECTORY_SEPARATOR);
define('RBS_TRAVEL_UPLOADS_PATH_LOGS', RBS_TRAVEL_UPLOADS_PATH . 'logs' . DIRECTORY_SEPARATOR);
define('RBS_TRAVEL_UPLOADS_PATH_MAPS', RBS_TRAVEL_UPLOADS_PATH . 'maps' . DIRECTORY_SEPARATOR);

// Plugin URLs
define('RBS_TRAVEL_PLUGIN_URL', plugin_dir_url(__FILE__));
define('RBS_TRAVEL_URL_ASSETS', RBS_TRAVEL_PLUGIN_URL . 'assets/');
define('RBS_TRAVEL_UPLOAD_URL', wp_upload_url());

// API Configuration - Enhanced for Ideas
define('RBS_TRAVEL_API_URL', 'https://online.travelcompositor.com/resources'); // WITHOUT ENDING SLASH!!!
define('RBS_TRAVEL_IDEAS_API_URL', 'https://online.travelcompositor.com/travelidea'); // Ideas endpoint

// Include core files
require_once RBS_TRAVEL_PLUGIN_PATH_INCLUDES . 'core.php';
require_once RBS_TRAVEL_PLUGIN_PATH_INCLUDES . 'database.php';
require_once RBS_TRAVEL_PLUGIN_PATH_INCLUDES . 'api-client.php';
require_once RBS_TRAVEL_PLUGIN_PATH_INCLUDES . 'ideas-handler.php'; // NEW
require_once RBS_TRAVEL_PLUGIN_PATH_SHORTCODES . 'travel-assistant.php';

class RBSTravelEnhanced {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        
        // Existing AJAX handlers
        add_action('wp_ajax_rbs_upload_document', array($this, 'handle_document_upload'));
        add_action('wp_ajax_nopriv_rbs_upload_document', array($this, 'handle_document_upload'));
        
        // NEW: Ideas AJAX handlers
        add_action('wp_ajax_rbs_search_idea', array($this, 'handle_search_idea'));
        add_action('wp_ajax_nopriv_rbs_search_idea', array($this, 'handle_search_idea'));
        add_action('wp_ajax_rbs_browse_ideas', array($this, 'handle_browse_ideas'));
        add_action('wp_ajax_nopriv_rbs_browse_ideas', array($this, 'handle_browse_ideas'));
        add_action('wp_ajax_rbs_search_high_ids', array($this, 'handle_search_high_ids'));
        add_action('wp_ajax_nopriv_rbs_search_high_ids', array($this, 'handle_search_high_ids'));
        
        // Chat with Ideas context
        add_action('wp_ajax_rbs_chat_with_ideas', array($this, 'handle_chat_with_ideas'));
        add_action('wp_ajax_nopriv_rbs_chat_with_ideas', array($this, 'handle_chat_with_ideas'));
    }
    
    public function init() {
        $this->create_enhanced_database_tables();
    }
    
    public function enqueue_scripts() {
        wp_enqueue_script('rbs-travel-enhanced-js', RBS_TRAVEL_URL_ASSETS . 'rbs-travel-enhanced.js', array('jquery'), RBS_TRAVEL_VERSION, true);
        wp_enqueue_style('rbs-travel-enhanced-css', RBS_TRAVEL_URL_ASSETS . 'rbs-travel-enhanced.css', array(), RBS_TRAVEL_VERSION);
        
        // Localize script with your existing structure
        wp_localize_script('rbs-travel-enhanced-js', 'rbs_travel_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('rbs_travel_nonce'),
            'api_url' => RBS_TRAVEL_API_URL,
            'ideas_api_url' => RBS_TRAVEL_IDEAS_API_URL
        ));
    }
    
    private function create_enhanced_database_tables() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // Enhanced ideas table
        $ideas_table = $wpdb->prefix . 'rbs_travel_ideas';
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
            currency varchar(10) DEFAULT 'EUR',
            status varchar(50) DEFAULT 'active',
            services_data longtext,
            images_data text,
            booking_data longtext,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY unique_idea (idea_id, microsite_id),
            INDEX idx_user_id (user_id),
            INDEX idx_microsite (microsite_id),
            INDEX idx_status (status)
        ) $charset_collate;";
        
        // Enhanced chat table with Ideas context
        $chat_table = $wpdb->prefix . 'rbs_travel_chat_enhanced';
        $chat_sql = "CREATE TABLE $chat_table (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            user_id mediumint(9) NOT NULL,
            session_id varchar(100) NOT NULL,
            message text NOT NULL,
            response text NOT NULL,
            context_type varchar(50), -- 'document', 'idea', 'mixed'
            context_data longtext, -- JSON with document/idea references
            timestamp datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            INDEX idx_session (session_id),
            INDEX idx_user_id (user_id),
            INDEX idx_context_type (context_type)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($ideas_sql);
        dbDelta($chat_sql);
    }
    
    // NEW: Ideas handlers
    public function handle_search_idea() {
        check_ajax_referer('rbs_travel_nonce', 'nonce');
        
        $idea_id = sanitize_text_field($_POST['idea_id']);
        $microsite_id = sanitize_text_field($_POST['microsite_id']);
        
        // Use your existing API structure
        $api_client = new RBSTravelAPIClient();
        $idea_data = $api_client->get_idea($microsite_id, $idea_id);
        
        if ($idea_data) {
            // Store in database
            $this->store_idea($idea_data, $microsite_id, $idea_id);
            wp_send_json_success($idea_data);
        } else {
            wp_send_json_error('Idea niet gevonden');
        }
    }
    
    public function handle_browse_ideas() {
        check_ajax_referer('rbs_travel_nonce', 'nonce');
        
        $microsite_id = sanitize_text_field($_POST['microsite_id']);
        
        $api_client = new RBSTravelAPIClient();
        $ideas = $api_client->browse_ideas($microsite_id);
        
        wp_send_json_success($ideas);
    }
    
    public function handle_search_high_ids() {
        check_ajax_referer('rbs_travel_nonce', 'nonce');
        
        $microsite_id = sanitize_text_field($_POST['microsite_id']);
        
        $api_client = new RBSTravelAPIClient();
        $high_ids = $api_client->search_high_ids($microsite_id);
        
        wp_send_json_success($high_ids);
    }
    
    public function handle_chat_with_ideas() {
        check_ajax_referer('rbs_travel_nonce', 'nonce');
        
        $message = sanitize_textarea_field($_POST['message']);
        $session_id = sanitize_text_field($_POST['session_id']);
        $user_id = get_current_user_id();
        
        // Get user's ideas and documents for context
        global $wpdb;
        
        $ideas = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}rbs_travel_ideas WHERE user_id = %d ORDER BY created_at DESC LIMIT 5",
            $user_id
        ));
        
        $documents = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}rbs_travel_documents WHERE user_id = %d ORDER BY upload_date DESC LIMIT 5",
            $user_id
        ));
        
        // Create AI context
        $context = array(
            'message' => $message,
            'ideas' => $ideas,
            'documents' => $documents,
            'user_id' => $user_id
        );
        
        // Call AI service (integrate with your existing AI handler)
        $ai_response = $this->call_ai_with_context($context);
        
        // Store chat with context
        $wpdb->insert(
            $wpdb->prefix . 'rbs_travel_chat_enhanced',
            array(
                'user_id' => $user_id,
                'session_id' => $session_id,
                'message' => $message,
                'response' => $ai_response,
                'context_type' => 'mixed',
                'context_data' => json_encode($context)
            )
        );
        
        wp_send_json_success(array('response' => $ai_response));
    }
    
    private function store_idea($idea_data, $microsite_id, $idea_id) {
        global $wpdb;
        
        $wpdb->replace(
            $wpdb->prefix . 'rbs_travel_ideas',
            array(
                'user_id' => get_current_user_id(),
                'idea_id' => $idea_id,
                'microsite_id' => $microsite_id,
                'title' => $idea_data['title'] ?? '',
                'description' => $idea_data['description'] ?? '',
                'destinations' => json_encode($idea_data['destinations'] ?? []),
                'start_date' => $idea_data['startDate'] ?? null,
                'end_date' => $idea_data['endDate'] ?? null,
                'total_price' => $idea_data['totalPrice']['amount'] ?? 0,
                'currency' => $idea_data['totalPrice']['currency'] ?? 'EUR',
                'services_data' => json_encode($idea_data),
                'images_data' => json_encode($idea_data['images'] ?? []),
                'booking_data' => json_encode($idea_data['bookings'] ?? [])
            )
        );
    }
    
    private function call_ai_with_context($context) {
        // Integrate with your existing AI system
        // This would call your OpenAI integration with Ideas + Documents context
        return "AI response based on ideas and documents context";
    }
}

// Initialize the enhanced plugin
new RBSTravelEnhanced();
?>
