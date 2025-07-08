-- Create a simple test table
CREATE TABLE IF NOT EXISTS test_table (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO test_table (name) VALUES ('Test Record');
SELECT * FROM test_table;
