<?php
/**
 * Plugin Name: rbsTravel Enhanced
 * Plugin URI: https://www.robas.com/plugins/wordpress/rbsTravel
 * Description: Travel and booking by API with Ideas support
 * Author: Robas Internet Oplossingen
 * Author URI: https://www.robas.com/
 * Version: 0.0.11
 * Text Domain: rbs-travel
 * Domain Path: /languages
 */

namespace RBS_TRAVEL;

if (!defined('ABSPATH')) 
    exit;

if (!class_exists('rbsTravel')) {
    
    class rbsTravel {                   
    
        private $plugin_objects; 
        private $plugin_options;
        
        public function __construct() {
            // Set plugin defines:
            $this->rbsDefines();
          
            // Load plugin files:
            $this->rbsLoad(); 

            // Initialize plugin:
            $this->rbsInit();        
        }
        
        /*** Set plugin defines ***/
        private function rbsDefines() {
            $wp_upload_dir = wp_upload_dir();
            
            // Setup directory and uri variables (used in defines.php)
            $upload_directory = $wp_upload_dir['basedir'] . DIRECTORY_SEPARATOR . 'rbs-travel' . DIRECTORY_SEPARATOR;
            $upload_url = $wp_upload_dir['baseurl'] . '/rbs-travel/';
            
            // Load "defines" file:
            require_once __DIR__ . DIRECTORY_SEPARATOR . 'defines.php';
            
            // Create directories if not exist:
            if (!file_exists(RBS_TRAVEL_UPLOADS_PATH)) {
                mkdir(RBS_TRAVEL_UPLOADS_PATH, 0777, true);                
            }
            
            if (!file_exists(RBS_TRAVEL_UPLOADS_PATH_TMP)) {
                mkdir(RBS_TRAVEL_UPLOADS_PATH_TMP, 0777, true);                
            }            
            
            if (!file_exists(RBS_TRAVEL_UPLOADS_PATH_LOGS)) {
                mkdir(RBS_TRAVEL_UPLOADS_PATH_LOGS, 0777, true);                
            }    
            
            if (!file_exists(RBS_TRAVEL_UPLOADS_PATH_MAPS)) {
                mkdir(RBS_TRAVEL_UPLOADS_PATH_MAPS, 0777, true);                
            }
        }
        
        /*** Load the 'plugin php files': ***/
        private function rbsLoad() {
            /** Helpers: **/
            require RBS_TRAVEL_PLUGIN_PATH_HELPERS . 'rbstravel-functions.php';
       
            /** Includes: **/
            require RBS_TRAVEL_PLUGIN_PATH_INCLUDES . 'rbstravel-settings.class.php';
            require RBS_TRAVEL_PLUGIN_PATH_INCLUDES . 'rbstravel-menus.class.php';	    
            require RBS_TRAVEL_PLUGIN_PATH_INCLUDES . 'rbstravel-posttype.class.php';
            require RBS_TRAVEL_PLUGIN_PATH_INCLUDES . 'rbstravel-ajax.class.php';
            require RBS_TRAVEL_PLUGIN_PATH_INCLUDES . 'rbstravel-api.class.php';
            require RBS_TRAVEL_PLUGIN_PATH_INCLUDES . 'rbstravel-meta.class.php';
            require RBS_TRAVEL_PLUGIN_PATH_INCLUDES . 'rbstravel-import.class.php';
            require RBS_TRAVEL_PLUGIN_PATH_INCLUDES . 'rbstravel-remote-travels.class.php';
            require RBS_TRAVEL_PLUGIN_PATH_INCLUDES . 'rbstravel-geocoding.class.php';
            
            // ✅ FIXED: Enable Ideas class (was commented out)
            require RBS_TRAVEL_PLUGIN_PATH_INCLUDES . 'rbstravel-ideas.class.php';

            /** Shortcodes: */
            require RBS_TRAVEL_PLUGIN_PATH_SHORTCODES . 'rbstravel-sc-idealist.php';
            require RBS_TRAVEL_PLUGIN_PATH_SHORTCODES . 'rbstravel-sc-ideajson.php';
            
            // ✅ NEW: Enhanced Ideas shortcode
            require RBS_TRAVEL_PLUGIN_PATH_SHORTCODES . 'rbstravel-sc-ideas-enhanced.php';

            if (!is_admin()) {
                require RBS_TRAVEL_PLUGIN_PATH_INCLUDES . 'rbstravel-frontend.class.php';
            }
        }
        
        /*** Set 'action' and 'filter' hooks: ***/
        private function rbsInit() {
            // Backend "scripts":
            add_action('admin_enqueue_scripts', array($this, 'backend_scripts_and_styles'), 10, 1);            
            
            // Frontend "scripts":
            add_action('wp_enqueue_scripts', array($this, 'frontend_scripts_and_styles'), 10, 1);

            // Languages:
            add_action('plugins_loaded', array($this, 'rbs_load_textdomain'));
            
            // ✅ NEW: Ideas AJAX handlers
            add_action('wp_ajax_rbstravel_search_ideas', array($this, 'ajax_search_ideas'));
            add_action('wp_ajax_nopriv_rbstravel_search_ideas', array($this, 'ajax_search_ideas'));
            
            add_action('wp_ajax_rbstravel_browse_ideas', array($this, 'ajax_browse_ideas'));
            add_action('wp_ajax_nopriv_rbstravel_browse_ideas', array($this, 'ajax_browse_ideas'));
            
            add_action('wp_ajax_rbstravel_search_high_ids', array($this, 'ajax_search_high_ids'));
            add_action('wp_ajax_nopriv_rbstravel_search_high_ids', array($this, 'ajax_search_high_ids'));
        }
        
        // ✅ NEW: AJAX Handlers for Ideas
        public function ajax_search_ideas() {
            check_ajax_referer('rbstravel_nonce', 'nonce');
            
            $idea_id = sanitize_text_field($_POST['idea_id']);
            $microsite_id = sanitize_text_field($_POST['microsite_id'] ?? '');
            
            try {
                $api = new \RBS_TRAVEL\INCLUDES\RBS_TRAVEL_Api();
                $result = $api->GetIdeas($idea_id);
                
                if (isset($result['not_found'])) {
                    wp_send_json_error($result['not_found']);
                } else {
                    wp_send_json_success($result);
                }
            } catch (Exception $e) {
                wp_send_json_error('API Error: ' . $e->getMessage());
            }
        }
        
        public function ajax_browse_ideas() {
            check_ajax_referer('rbstravel_nonce', 'nonce');
            
            $first = intval($_POST['first'] ?? 0);
            $limit = intval($_POST['limit'] ?? 10);
            
            try {
                $api = new \RBS_TRAVEL\INCLUDES\RBS_TRAVEL_Api();
                $result = $api->GetIdeas(null, array(), $first, $limit);
                wp_send_json_success($result);
            } catch (Exception $e) {
                wp_send_json_error('API Error: ' . $e->getMessage());
            }
        }
        
        public function ajax_search_high_ids() {
            check_ajax_referer('rbstravel_nonce', 'nonce');
            
            $found_ideas = array();
            $api = new \RBS_TRAVEL\INCLUDES\RBS_TRAVEL_Api();
            
            // Smart search strategy for high IDs
            $search_patterns = array(
                // Year-based patterns
                range(20240000, 20241000, 100),
                range(20230000, 20231000, 100),
                // High number patterns  
                range(35000000, 30000000, -1000000),
                range(30000000, 25000000, -1000000),
                range(25000000, 20000000, -1000000),
                // Around your working ID
                range(24926536 + 1000, 24926536 - 1000, -100)
            );
            
            $attempts = 0;
            $max_attempts = 50;
            
            foreach ($search_patterns as $pattern) {
                foreach ($pattern as $test_id) {
                    if ($attempts >= $max_attempts) break 2;
                    
                    try {
                        $result = $api->GetIdeas($test_id);
                        
                        if (isset($result['idea'][0]) && $result['idea'][0] !== null) {
                            $idea_data = $result['idea'][0];
                            $found_ideas[] = array(
                                'id' => $test_id,
                                'title' => $idea_data['title'] ?? "Idea {$test_id}",
                                'description' => $idea_data['description'] ?? '',
                                'destinations' => $idea_data['destinations'] ?? array(),
                                'price' => $idea_data['totalPrice'] ?? null
                            );
                        }
                    } catch (Exception $e) {
                        // Continue searching even if one fails
                    }
                    
                    $attempts++;
                    
                    if (count($found_ideas) >= 10) {
                        break 2;
                    }
                }
            }
            
            // Sort by ID descending
            usort($found_ideas, function($a, $b) {
                return $b['id'] - $a['id'];
            });
            
            if (count($found_ideas) > 0) {
                wp_send_json_success($found_ideas);
            } else {
                wp_send_json_error('Geen geldige hoge ID\'s gevonden');
            }
        }
        
        private function get_filectime($file_path) {
            if (!file_exists($file_path)) {
                return false;
            }
            return filectime($file_path);
        }
        
        /* Add "plugin" scripts and styles: */
        public function backend_scripts_and_styles($hook_suffix) {
            // Localize Script (vars):
            $localized_script = array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'admin_script' => true,
                'debug' => true,
                'nonce' => wp_create_nonce('rbstravel_nonce') // ✅ Added nonce
            );            

            wp_enqueue_style('rbstravel_backend_styles', plugin_dir_url( __FILE__ ) . 'assets/css/backend.css?' . $this->get_filectime(RBS_TRAVEL_PLUGIN_PATH_ASSETS . 'css' . DIRECTORY_SEPARATOR . 'backend.css'));
           
            $script_url = plugin_dir_url( __FILE__ ) . 'assets/js/backend.js?' .  $this->get_filectime(RBS_TRAVEL_PLUGIN_PATH_ASSETS . 'js' . DIRECTORY_SEPARATOR . 'backend.js');               
            wp_enqueue_script('rbstravel_backend_script', $script_url, array('jquery'));
            wp_localize_script('rbstravel_backend_script', 'rbsTravel', $localized_script);      

            $rbsmaps_script = RBS_TRAVEL_PLUGIN_URL_ASSETS . 'js/rbs-maps.js?' . filemtime(RBS_TRAVEL_PLUGIN_PATH_ASSETS . 'js' . DIRECTORY_SEPARATOR . 'rbstravel-maps.js');
            wp_enqueue_script('rbs_maps_script', $rbsmaps_script, array(), null, true);
        }        
        
        public function frontend_scripts_and_styles($hook_suffix) {
            // ✅ Enhanced frontend scripts with Ideas support
            $localized_script = array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('rbstravel_nonce'),
                'admin_script' => false
            );    
            
            wp_enqueue_style('rbsp_frontend_styles', plugin_dir_url( __FILE__ ) . 'assets/css/frontend.css?' . $this->get_filectime(RBS_TRAVEL_PLUGIN_PATH_ASSETS . 'css' . DIRECTORY_SEPARATOR . 'frontend.css'));
            
            $script_url = plugin_dir_url( __FILE__ ) . 'assets/js/frontend.js?' .  $this->get_filectime(RBS_TRAVEL_PLUGIN_PATH_ASSETS . 'js' . DIRECTORY_SEPARATOR . 'frontend.js');               
            wp_enqueue_script('rbstravel_frontend_script', $script_url, array('jquery'));
            wp_localize_script('rbstravel_frontend_script', 'rbsTravel', $localized_script);
        }
        
        public function rbs_load_textdomain() {      
           $path = dirname( plugin_basename(__FILE__)) . DIRECTORY_SEPARATOR . 'languages' . DIRECTORY_SEPARATOR;
           $result = load_plugin_textdomain('rbs-travel', false, $path);
       }                
    }
    
    /*** Create "plugin instance": ***/
    $rbsTravel = new rbsTravel();
}
?>
