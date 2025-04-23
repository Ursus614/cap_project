namespace diagnostic;

entity SystemDiagnostic {
  key ID: UUID;
  systemType: String;
  area: String;
  score: Integer;
}