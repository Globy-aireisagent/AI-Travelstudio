<?php
/**
 * Enhanced API Client for Travel Compositor with Ideas support
 */

class RBSTravelAPIClient {
    
    private $base_url;
    private $ideas_url;
    private $credentials;
    
    public function __construct() {
        $this->base_url = RBS_TRAVEL_API_URL;
        $this->ideas_url = RBS_TRAVEL_IDEAS_API_URL;
        
        // Use your existing credentials system
        $this->credentials = array(
            'username' => get_option('rbs_travel_username'),
            'password' => get_option('rbs_travel_password')
        );
    }
    
    public function get_idea($microsite_id, $idea_id) {
        $url = $this->ideas_url . "/{$microsite_id}/info/{$idea_id}";
        
        $response = wp_remote_get($url, array(
            'headers' => $this->get_auth_headers(),
            'timeout' => 30
        ));
        
        if (is_wp_error($response)) {
            return false;
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        return $data;
    }
    
    public function browse_ideas($microsite_id, $limit = 20) {
        // Implementation for browsing ideas
        $found_ideas = array();
        
        // Test common ID patterns
        $test_ids = array(
            35000000, 30000000, 25000000, 20000000, 15000000,
            10000000, 5000000, 1000000, 500000, 100000
        );
        
        foreach ($test_ids as $test_id) {
            $idea = $this->get_idea($microsite_id, $test_id);
            if ($idea) {
                $found_ideas[] = array(
                    'id' => $test_id,
                    'title' => $idea['title'] ?? "Idea {$test_id}",
                    'description' => $idea['description'] ?? '',
                    'preview' => $this->create_idea_preview($idea)
                );
                
                if (count($found_ideas) >= $limit) {
                    break;
                }
            }
        }
        
        return $found_ideas;
    }
    
    public function search_high_ids($microsite_id, $max_attempts = 50) {
        $found_ids = array();
        $attempts = 0;
        
        // Smart search strategy
        $search_patterns = array(
            // Year-based patterns
            range(20240000, 20241000, 100),
            range(20230000, 20231000, 100),
            // High number patterns
            range(50000000, 30000000, -1000000),
            // Around known working IDs
            range(24926536 + 1000, 24926536 - 1000, -100)
        );
        
        foreach ($search_patterns as $pattern) {
            foreach ($pattern as $test_id) {
                if ($attempts >= $max_attempts) break 2;
                
                $idea = $this->get_idea($microsite_id, $test_id);
                if ($idea) {
                    $found_ids[] = array(
                        'id' => $test_id,
                        'title' => $idea['title'] ?? "Idea {$test_id}",
                        'preview' => $this->create_idea_preview($idea)
                    );
                }
                
                $attempts++;
                
                if (count($found_ids) >= 10) {
                    break 2;
                }
            }
        }
        
        // Sort by ID descending
        usort($found_ids, function($a, $b) {
            return $b['id'] - $a['id'];
        });
        
        return $found_ids;
    }
    
    private function create_idea_preview($idea) {
        return array(
            'destinations' => $idea['destinations'] ?? [],
            'price' => $idea['totalPrice'] ?? null,
            'duration' => $this->calculate_duration($idea),
            'services_count' => count($idea['services'] ?? []),
            'images_count' => count($idea['images'] ?? [])
        );
    }
    
    private function calculate_duration($idea) {
        if (isset($idea['startDate']) && isset($idea['endDate'])) {
            $start = new DateTime($idea['startDate']);
            $end = new DateTime($idea['endDate']);
            return $start->diff($end)->days;
        }
        return null;
    }
    
    private function get_auth_headers() {
        // Use your existing authentication method
        return array(
            'Authorization' => 'Basic ' . base64_encode($this->credentials['username'] . ':' . $this->credentials['password']),
            'Content-Type' => 'application/json'
        );
    }
}
?>
