DO $$ 
BEGIN
  -- Check if the mini_sites trigger exists
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_mini_sites_last_updated') THEN
    -- Drop the existing trigger
    DROP TRIGGER IF EXISTS update_mini_sites_last_updated ON mini_sites;
    
    -- Create a new function specifically for updating last_updated
    CREATE OR REPLACE FUNCTION update_last_updated_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.last_updated = now();
      RETURN NEW;
    END;
    $$ language 'plpgsql';
    
    -- Create a new trigger using the correct function
    CREATE TRIGGER update_mini_sites_last_updated
      BEFORE UPDATE ON mini_sites
      FOR EACH ROW
      EXECUTE FUNCTION update_last_updated_column();
      
    RAISE NOTICE 'Successfully updated the mini_sites trigger to use last_updated field';
  ELSE
    RAISE NOTICE 'Trigger update_mini_sites_last_updated does not exist';
  END IF;
END $$;
