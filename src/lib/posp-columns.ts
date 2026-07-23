export type PospColumn = {
  key: string;
  label: string;
  type: "text" | "date";
};

// Single source of truth for the posp_records shape — the search API's
// searchable-column list and the UI's display columns both derive from this.
export const POSP_COLUMNS: PospColumn[] = [
  { key: "associate_name", label: "Associate Name", type: "text" },
  { key: "associate_id", label: "Associate ID", type: "text" },
  { key: "type", label: "Type", type: "text" },
  { key: "onboarding_id", label: "Onboarding ID", type: "text" },
  { key: "document_recv_date", label: "Document Recv Date", type: "date" },
  { key: "pos_name", label: "POS Name", type: "text" },
  { key: "contact_number", label: "Contact Number", type: "text" },
  { key: "email", label: "Email", type: "text" },
  { key: "city", label: "City", type: "text" },
  { key: "pin_code", label: "Pin Code", type: "text" },
  { key: "aadhar_number", label: "Aadhar Number", type: "text" },
  { key: "pan_number", label: "Pan Number", type: "text" },
  { key: "dob", label: "D.O.B", type: "date" },
  { key: "gst_number", label: "GST Number", type: "text" },
  { key: "marsheet", label: "Marsheet", type: "text" },
  { key: "bank_name", label: "Bank Name", type: "text" },
  { key: "account_number", label: "Account Number", type: "text" },
  { key: "ifsc_code", label: "IFSC Code", type: "text" },
];

export const SEARCHABLE_COLUMNS = POSP_COLUMNS.filter((c) => c.type === "text").map(
  (c) => c.key
);

export type PospRecord = Record<string, string | number | null>;
