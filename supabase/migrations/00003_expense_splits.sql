CREATE TABLE expense_splits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id uuid REFERENCES expenses ON DELETE CASCADE NOT NULL,
  trip_id uuid REFERENCES trips NOT NULL,
  user_id uuid REFERENCES profiles NOT NULL,
  amount_cents bigint NOT NULL,
  is_settled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (expense_id, user_id)
);

CREATE INDEX idx_expense_splits_expense ON expense_splits(expense_id);
CREATE INDEX idx_expense_splits_trip ON expense_splits(trip_id);
CREATE INDEX idx_expense_splits_user ON expense_splits(user_id);

ALTER TABLE expense_splits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trip members can view splits"
  ON expense_splits FOR SELECT
  USING (
    trip_id IN (
      SELECT trip_id FROM trip_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Editors and owners can insert splits"
  ON expense_splits FOR INSERT
  WITH CHECK (
    trip_id IN (
      SELECT trip_id FROM trip_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Editors and owners can update splits"
  ON expense_splits FOR UPDATE
  USING (
    trip_id IN (
      SELECT trip_id FROM trip_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Editors and owners can delete splits"
  ON expense_splits FOR DELETE
  USING (
    trip_id IN (
      SELECT trip_id FROM trip_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON expense_splits
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE expense_splits;
