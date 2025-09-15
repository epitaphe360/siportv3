-- Allow unauthenticated users to read events
CREATE POLICY "Public can read events"
  ON events
  FOR SELECT
  TO anon
  USING (true);
