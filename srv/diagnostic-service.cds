using { diagnostic as my } from '../db/data-model';

service DiagnosticService {
  entity Diagnostics as projection on my.SystemDiagnostic;
}