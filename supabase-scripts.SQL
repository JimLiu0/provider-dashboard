CREATE TABLE patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  middle_name text,
  last_name text NOT NULL,
  date_of_birth date NOT NULL,
  status text NOT NULL CHECK (status IN ('Inquiry', 'Onboarding', 'Active', 'Churned')),

  street_address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,

  notes text,

  created_at timestamp with time zone DEFAULT timezone('utc', now())
);