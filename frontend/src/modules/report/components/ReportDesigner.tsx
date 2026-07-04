import React, { useState } from 'react';
import type { ReportTemplate, ReportSection } from '../models/types';
import { Card } from '../../../components/Layout/Card';
import { Button } from '../../../components/Foundation/Button';
import { useNotification } from '../../../infrastructure/notifications/useNotification';

interface ReportDesignerProps {
  initialTemplate: ReportTemplate;
  initialSections: ReportSection[];
  readOnly?: boolean;
  onSave?: (template: ReportTemplate, sections: ReportSection[]) => void;
}

export const ReportDesigner: React.FC<ReportDesignerProps> = ({
  initialTemplate,
  initialSections,
  readOnly = false,
  onSave,
}) => {
  const { addToast } = useNotification();
  const [template, setTemplate] = useState<ReportTemplate>({ ...initialTemplate });
  const [sections, setSections] = useState<ReportSection[]>(initialSections.map((s) => ({ ...s })));

  const handleToggleSection = (sectionId: string) => {
    if (readOnly) return;
    setSections(
      sections.map((s) => (s.sectionId === sectionId ? { ...s, visible: !s.visible } : s))
    );
  };

  const handleTemplateChange = (templateId: string) => {
    if (readOnly) return;
    let name = 'Standard Microbiology Report';
    let showDemographics = true;
    let showAstGrid = true;
    let showClinicalInterpretation = true;

    if (templateId === 'hospital') {
      name = 'Hospital Summary Report';
    } else if (templateId === 'clinic') {
      name = 'Clinic Outpatient Report';
      showClinicalInterpretation = false;
    } else if (templateId === 'compact') {
      name = 'Compact Laboratory Report';
      showClinicalInterpretation = false;
    }

    setTemplate({
      ...template,
      templateId,
      name,
      showDemographics,
      showAstGrid,
      showClinicalInterpretation,
    });
  };

  const handleSave = () => {
    if (onSave) {
      onSave(template, sections);
      addToast('success', 'Report design configurations updated.');
    }
  };

  return (
    <Card style={styles.container}>
      <h4 style={{ margin: '0 0 12px 0', font: 'var(--type-heading-item)' }}>Report Design & Template Configuration</h4>

      <div style={styles.grid}>
        {/* Template Select */}
        <div>
          <label className="lims-form-label" style={styles.label}>Select Report Template</label>
          <select
            value={template.templateId}
            onChange={(e) => handleTemplateChange(e.target.value)}
            disabled={readOnly}
            className="lims-input"
            style={{ width: '100%', height: '36px' }}
          >
            <option value="standard">Standard Microbiology Report</option>
            <option value="hospital">Hospital Summary Report</option>
            <option value="clinic">Clinic Outpatient Report</option>
            <option value="compact">Compact Laboratory Report</option>
          </select>
        </div>

        {/* Section visibility checkboxes */}
        <div>
          <label className="lims-form-label" style={styles.label}>Visible Report Sections</label>
          <div style={styles.checkboxList}>
            {sections.map((s) => (
              <label key={s.sectionId} style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={s.visible}
                  onChange={() => handleToggleSection(s.sectionId)}
                  disabled={readOnly}
                  style={{ width: '16px', height: '16px', cursor: readOnly ? 'default' : 'pointer' }}
                />
                <span style={{ fontSize: '0.85rem' }}>{s.title}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Disclaimer footer input */}
        <div style={{ gridColumn: 'span 2' }}>
          <label className="lims-form-label" style={styles.label}>Custom Report Disclaimer Text</label>
          <textarea
            value={template.disclaimerText}
            onChange={(e) => !readOnly && setTemplate({ ...template, disclaimerText: e.target.value })}
            disabled={readOnly}
            className="lims-input"
            placeholder="Type standard disclaimer..."
            style={{ width: '100%', height: '60px', resize: 'vertical', boxSizing: 'border-box', padding: '8px' }}
          />
        </div>
      </div>

      {!readOnly && onSave && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          <Button variant="solid" onClick={handleSave}>
            Apply Design Changes
          </Button>
        </div>
      )}
    </Card>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { padding: 'var(--spacing-md)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' },
  label: { display: 'block', marginBottom: '6px' },
  checkboxList: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '6px 0' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
};

export default ReportDesigner;
