import React, { useState } from 'react';
import { useGlobalState } from '../providers/GlobalStateProvider';
import { AstInterpretation } from '../types';
import { 
  Button, IconButton, PageTitle, SectionTitle, SubsectionTitle, BodyText, SmallText, MonospaceCode, Badge, StatusBadge, Avatar, Divider, Tooltip 
} from '../components/Foundation';
import { 
  TextInput, Select, MultiSelect, Checkbox, Switch, FileUpload 
} from '../components/Form';
import { 
  Card, Tabs, Accordion 
} from '../components/Layout';
import { 
  DataTable, KpiCard 
} from '../components/Data';
import { 
  Modal, Drawer, Dialog 
} from '../components/Overlay';
import { 
  ObservationCard, AstMatrix, QcIndicator 
} from '../components/Laboratory';
import { HelpCircle } from 'lucide-react';

export const ComponentPlaybook: React.FC = () => {
  const { theme, toggleTheme, density, setDensity } = useGlobalState();
  const [activeCategory, setActiveCategory] = useState<'foundation' | 'form' | 'layout' | 'data' | 'overlay' | 'laboratory'>('foundation');
  const [selectedComponentId, setSelectedComponentId] = useState<string>('button');

  // Form mock states
  const [inputText, setInputText] = useState('John Doe');
  const [selectVal, setSelectVal] = useState('urine');
  const [multiVal, setMultiVal] = useState(['blood']);
  const [checkVal, setCheckVal] = useState(true);
  const [switchVal, setSwitchVal] = useState(false);

  // Overlay states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Mock datasets for complex components
  const mockTableData = [
    { id: '1', name: 'John Doe', mrn: 'MRN-1294', specimen: 'Blood', status: 'RECEIVED' },
    { id: '2', name: 'Jane Smith', mrn: 'MRN-8392', specimen: 'Urine', status: 'INCUBATION' },
    { id: '3', name: 'Bob Johnson', mrn: 'MRN-4422', specimen: 'Sputum', status: 'REJECTED' }
  ];

  const mockAstResults = [
    { astId: 'a1', specimenId: 's1', organismName: 'E. coli', antibioticName: 'Ciprofloxacin', antibioticCode: 'CIP', method: 'Disk Diffusion' as const, zoneDiameter: 22, interpretation: AstInterpretation.S, determinedAt: '' },
    { astId: 'a2', specimenId: 's1', organismName: 'E. coli', antibioticName: 'Ampicillin', antibioticCode: 'AMP', method: 'Disk Diffusion' as const, zoneDiameter: 12, interpretation: AstInterpretation.R, determinedAt: '' }
  ];

  // Component metadata registry (documentation details)
  const componentsRegistry: Record<string, {
    name: string;
    cmpId: string;
    purpose: string;
    states: string;
    patterns: string;
    a11y: string;
    shortcuts: string;
    guidelines: string;
    renderDemo: () => React.ReactNode;
  }> = {
    // FOUNDATION
    button: {
      name: 'Button',
      cmpId: 'CMP-101',
      purpose: 'Standard trigger button for main laboratory actions.',
      states: 'Solid, Outline, Text, Hover, Focus, Active, Disabled, Loading.',
      patterns: 'IP-NAV, IP-FORM.',
      a11y: 'Uses aria-disabled, aria-busy spinners, and focus rings.',
      shortcuts: 'Space / Enter to press.',
      guidelines: 'Use Solid buttons for main action paths, Outline for secondary cancels.',
      renderDemo: () => (
        <div style={playbookStyles.demoGrid}>
          <div>
            <strong>Solid Default:</strong>
            <Button>Inoculate Plate</Button>
          </div>
          <div>
            <strong>Solid Loading:</strong>
            <Button loading>Inoculate Plate</Button>
          </div>
          <div>
            <strong>Outline Focus:</strong>
            <Button variant="outline">Secondary Action</Button>
          </div>
          <div>
            <strong>Text Disabled:</strong>
            <Button variant="text" disabled>Disabled Text</Button>
          </div>
        </div>
      )
    },
    iconbutton: {
      name: 'IconButton',
      cmpId: 'CMP-102',
      purpose: 'Compact buttons rendering only icons with screen-reader friendly labels.',
      states: 'Default, Hover, Active, Disabled, Focus.',
      patterns: 'IP-NAV.',
      a11y: 'Forces mapping of aria-label and title.',
      shortcuts: 'Space / Enter to toggle.',
      guidelines: 'Use for header control panels, edit drawers, and close buttons.',
      renderDemo: () => (
        <div style={playbookStyles.demoGrid}>
          <IconButton icon={<HelpCircle size={16} />} label="Help Utility" />
          <IconButton icon={<HelpCircle size={16} />} label="Info Overlay" disabled />
        </div>
      )
    },
    typography: {
      name: 'Typography',
      cmpId: 'CMP-103',
      purpose: 'Defines typography presets for consistent title scales.',
      states: 'Page Title, Section Header, Subsection Header, Body, Small, Monospace.',
      patterns: 'None.',
      a11y: 'Enforces correct heading levels (h1, h2, h3).',
      shortcuts: 'None.',
      guidelines: 'Always use PageTitle once per page layout, Subsection for cards.',
      renderDemo: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          <PageTitle>Page Heading Title</PageTitle>
          <SectionTitle>Section Sub-Header Title</SectionTitle>
          <SubsectionTitle>Card Subsection Title</SubsectionTitle>
          <BodyText>Standard body text for observation logs.</BodyText>
          <SmallText>Clinical metadata description notes.</SmallText>
          <div>
            <MonospaceCode>SPC-2026-000101</MonospaceCode>
          </div>
        </div>
      )
    },
    badge: {
      name: 'Badge / StatusBadge',
      cmpId: 'CMP-104',
      purpose: 'Displays numeric counts or color-coded clinical status states.',
      states: 'Success (Green), Warning (Amber), Danger (Red), Info (Blue), Pending (Grey).',
      patterns: 'IP-GRID.',
      a11y: 'Uses status role mappings.',
      shortcuts: 'None.',
      guidelines: 'Do not use StatusBadge for navigation. Reserved for state alerts.',
      renderDemo: () => (
        <div style={playbookStyles.demoGrid}>
          <div>
            <strong>Counter Badge:</strong>
            <Badge count={24} />
          </div>
          <StatusBadge status="success" label="Passed QC" />
          <StatusBadge status="warning" label="Incubating" />
          <StatusBadge status="danger" label="Critical Result" />
          <StatusBadge status="info" label="Active" />
          <StatusBadge status="pending" label="Pending Verification" />
        </div>
      )
    },
    avatar: {
      name: 'Avatar',
      cmpId: 'CMP-105',
      purpose: 'Visual user identity card or initials circular fallback indicator.',
      states: 'Initials view, Image src view.',
      patterns: 'None.',
      a11y: 'Uses aria-label mapping.',
      shortcuts: 'None.',
      guidelines: 'Place in header profiles and audit trail lists.',
      renderDemo: () => (
        <div style={playbookStyles.demoGrid}>
          <Avatar name="John Miller" />
          <Avatar name="Sarah Connor" />
        </div>
      )
    },
    tooltip: {
      name: 'Tooltip',
      cmpId: 'CMP-108',
      purpose: 'Hover or focus overlay showing context definitions.',
      states: 'Hover, Focus-within.',
      patterns: 'IP-NAV.',
      a11y: 'Utilizes aria-describedby mapping to tooltips.',
      shortcuts: 'Tab into child element to display.',
      guidelines: 'Use to define AST breakpoints or short form headers.',
      renderDemo: () => (
        <div style={{ padding: '20px 0' }}>
          <Tooltip content="CLSI guideline breakpoint reference database check.">
            <button style={{ padding: '6px 12px', border: '1px solid var(--color-border-default)' }}>Hover over me</button>
          </Tooltip>
        </div>
      )
    },
    divider: {
      name: 'Divider',
      cmpId: 'CMP-107',
      purpose: 'Splits layout components.',
      states: 'Horizontal, Vertical.',
      patterns: 'None.',
      a11y: 'Uses aria-orientation attribute.',
      shortcuts: 'None.',
      guidelines: 'Set height/width explicit limits for layout divides.',
      renderDemo: () => (
        <div>
          <span>Left Text</span>
          <Divider orientation="vertical" />
          <span>Right Text</span>
          <Divider orientation="horizontal" />
          <p>Separated line content.</p>
        </div>
      )
    },
    
    // FORM CONTROLS
    textinput: {
      name: 'TextInput / Form inputs',
      cmpId: 'CMP-201',
      purpose: 'Standard forms control wrapping labels, descriptions, and error warnings.',
      states: 'Pristine, Hover, Focus, Disabled, Error, Success.',
      patterns: 'IP-FORM.',
      a11y: 'Enforces id-to-label association, aria-invalid flags, and keyboard focus.',
      shortcuts: 'Tab in to focus, type to enter.',
      guidelines: 'Provide descriptions for specific MRN formats.',
      renderDemo: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <TextInput
            label="Patient Name"
            description="Enter full first and last name."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <TextInput
            label="Accession Barcode Number"
            error="ERR-007: Specimen barcode mismatch or invalid formatting."
            value="BAR-892"
            onChange={() => {}}
          />
          <TextInput
            label="Inoculation Shelf Location"
            success
            value="Incubator Shelf B-3"
            onChange={() => {}}
          />
        </div>
      )
    },
    select: {
      name: 'Select Selector',
      cmpId: 'CMP-203',
      purpose: 'Standard dropdown selection lists.',
      states: 'Default, Active, Disabled, Error, Success.',
      patterns: 'IP-FORM.',
      a11y: 'Labels target select directly.',
      shortcuts: 'Enter to open, arrow keys to toggle.',
      guidelines: 'Enforce default choice placeholders.',
      renderDemo: () => (
        <Select
          label="Specimen Type"
          description="Identify specimen source panels."
          value={selectVal}
          onChange={(e) => setSelectVal(e.target.value)}
          options={[
            { value: 'blood', label: 'Blood Culture' },
            { value: 'urine', label: 'Urine Culture' },
            { value: 'sputum', label: 'Sputum' }
          ]}
        />
      )
    },
    multiselect: {
      name: 'MultiSelect Selector',
      cmpId: 'CMP-204',
      purpose: 'Allows selection of multiple options rendering them as badges.',
      states: 'Pristine, Selected, Active Dropdown.',
      patterns: 'IP-FORM.',
      a11y: 'Tab-indexes combobox triggers and checkboxes.',
      shortcuts: 'Enter/Space to expand dropdown.',
      guidelines: 'Use for mapping panels and antibiotic group arrays.',
      renderDemo: () => (
        <MultiSelect
          label="Select Panels"
          options={[
            { value: 'blood', label: 'Blood agar' },
            { value: 'mac', label: 'MacConkey agar' },
            { value: 'choco', label: 'Chocolate agar' }
          ]}
          selectedValues={multiVal}
          onChange={setMultiVal}
        />
      )
    },
    checkbox: {
      name: 'Checkbox / Switch / Toggles',
      cmpId: 'CMP-207',
      purpose: 'Boolean selectors and toggle switches.',
      states: 'Checked, Unchecked, Disabled.',
      patterns: 'IP-FORM.',
      a11y: 'Uses keyboard focus handlers.',
      shortcuts: 'Space to toggle.',
      guidelines: 'Use Switch for live layout configurations (like dark mode), Checkbox for confirmations.',
      renderDemo: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <Checkbox
            label="Acknowledge Critical Result Warning"
            checked={checkVal}
            onChange={(e) => setCheckVal(e.target.checked)}
          />
          <Switch
            label="Automated Susceptibility Matrix guidelines check"
            checked={switchVal}
            onChange={setSwitchVal}
          />
        </div>
      )
    },
    fileupload: {
      name: 'FileUpload Dropzone',
      cmpId: 'CMP-210',
      purpose: 'Handles clinical file uploads with size and format checks.',
      states: 'Drag Active, Default, Uploading Progress, Completed, Error.',
      patterns: 'IP-FORM.',
      a11y: 'Exposes keyboard select options.',
      shortcuts: 'Enter to open file selector.',
      guidelines: 'Specify accept formats (e.g. .csv, .pdf) in configuration.',
      renderDemo: () => (
        <FileUpload
          label="Inoculation Lot Register CSV"
          accept=".csv"
          onFileSelect={(f) => console.log('selected file', f)}
        />
      )
    },

    // LAYOUTS
    card: {
      name: 'Card / Panel Layouts',
      cmpId: 'CMP-301',
      purpose: 'Structured surfaces isolating metrics and data grids.',
      states: 'Elevations (0, 1, 2, 3).',
      patterns: 'None.',
      a11y: 'Semantic div card container.',
      shortcuts: 'None.',
      guidelines: 'Set elevation 2 for lists, 3 for overlay boxes.',
      renderDemo: () => (
        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
          <Card elevation={1} style={{ padding: '12px', flex: 1 }}>Elevation 1 Card</Card>
          <Card elevation={2} style={{ padding: '12px', flex: 1 }}>Elevation 2 Card</Card>
        </div>
      )
    },
    tabs: {
      name: 'Tabs Component',
      cmpId: 'CMP-304',
      purpose: 'Handles segment views switching in details pages.',
      states: 'Active Tab, Hover, Focus.',
      patterns: 'IP-NAV.',
      a11y: 'Maps role tablist and tabpanels, sets tabIndex active.',
      shortcuts: 'Arrow keys to navigate tabs.',
      guidelines: 'Set explicit tab IDs to prevent layout mismatches.',
      renderDemo: () => (
        <Tabs
          items={[
            { id: 't1', label: 'Primary Plates', content: <p>Agar plate records display.</p> },
            { id: 't2', label: 'ASTSusceptibility', content: <p>SIR grids matrix list.</p> }
          ]}
        />
      )
    },
    accordion: {
      name: 'Accordion Accordion',
      cmpId: 'CMP-305',
      purpose: 'Collapsible detail accordion sections.',
      states: 'Expanded, Closed.',
      patterns: 'IP-GRID.',
      a11y: 'Uses aria-expanded on headers.',
      shortcuts: 'Space to expand/collapse.',
      guidelines: 'Use for secondary demographics views or audit records.',
      renderDemo: () => (
        <Accordion
          items={[
            { id: 'a1', title: 'Section A - Biological Controls', content: <p>QC strains history logs.</p> },
            { id: 'a2', title: 'Section B - Digital Signatures', content: <p>Pathologist signature release validation codes.</p> }
          ]}
        />
      )
    },

    // DATA
    datatable: {
      name: 'DataTable Grid',
      cmpId: 'CMP-401',
      purpose: 'Grid display for patients, orders, and specimen backlogs.',
      states: 'Sorted Columns, Select-All Checkbox, Empty.',
      patterns: 'IP-TABLE.',
      a11y: 'Full table tags, clear th descriptors.',
      shortcuts: 'Arrow keys to navigate cells.',
      guidelines: 'Configure responsive horizontal scrolling triggers for dense columns.',
      renderDemo: () => (
        <DataTable
          columns={[
            { key: 'name', label: 'Patient' },
            { key: 'mrn', label: 'MRN' },
            { key: 'specimen', label: 'Specimen' },
            { key: 'status', label: 'Status' }
          ]}
          data={mockTableData}
          rowKey="id"
        />
      )
    },
    kpicard: {
      name: 'KPI Card',
      cmpId: 'CMP-408',
      purpose: 'Displays turnaround times and specimen metrics.',
      states: 'Success, Pending, Warning, Danger colors.',
      patterns: 'None.',
      a11y: 'Exposes state description values.',
      shortcuts: 'None.',
      guidelines: 'Render trend direction indicators matching CLIA benchmarks.',
      renderDemo: () => (
        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
          <KpiCard title="Average Turnaround Time (TAT)" value="18.2 Hours" trend={{ direction: 'up', value: '4%' }} />
          <KpiCard title="Critical Flag Ratio" value="1.2 %" trend={{ direction: 'down', value: '0.2%' }} indicatorColor="var(--color-status-danger)" />
        </div>
      )
    },

    // OVERLAYS
    modal: {
      name: 'Modal Overlays & Drawers',
      cmpId: 'CMP-501',
      purpose: 'Standard modal overlays blocking active screens.',
      states: 'Opened Modal, Opened Drawer, Alert Dialog.',
      patterns: 'IP-NAV.',
      a11y: 'Traps keyboard focuses, aria-modal attributes.',
      shortcuts: 'ESC to close.',
      guidelines: 'Require confirmation buttons for destructive actions.',
      renderDemo: () => (
        <div style={playbookStyles.demoGrid}>
          <Button onClick={() => setIsModalOpen(true)}>Open Modal Box</Button>
          <Button onClick={() => setIsDrawerOpen(true)}>Open Right Drawer</Button>
          <Button onClick={() => setIsDialogOpen(true)}>Open Dialog Sheet</Button>

          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Laboratory Override Accession">
            <p>Acknowledge overriding quality criteria validations?</p>
            <TextInput label="Reason for override" required />
          </Modal>

          <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Audit History Log">
            <p>Log details listing verification codes.</p>
          </Drawer>

          <Dialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            title="Warning Alert"
            message="Confirm deleting this specimen record? This action will generate a compliance audit Override flag."
            confirmLabel="Confirm Delete"
            onConfirm={() => console.log('Deleted')}
            type="danger"
          />
        </div>
      )
    },

    // LABORATORY
    astmatrix: {
      name: 'AST Susceptibility Matrix',
      cmpId: 'CMP-804',
      purpose: 'Clinical grids rendering drug interpretations mapping CLSI rules.',
      states: 'Interpretation highlights (S, I, R).',
      patterns: 'IP-GRID.',
      a11y: 'High contrast badges.',
      shortcuts: 'None.',
      guidelines: 'Display interpretations S (Green), I (Amber), and R (Red) explicitly.',
      renderDemo: () => (
        <AstMatrix results={mockAstResults} />
      )
    },
    observation: {
      name: 'Observation Card & QC',
      cmpId: 'CMP-803',
      purpose: 'Renders growth readings, gram reaction, and biological controls validation.',
      states: 'Pure growth, Contamination warning, QC validation.',
      patterns: 'IP-GRID.',
      a11y: 'Screen reader updates.',
      shortcuts: 'None.',
      guidelines: 'Flag contamination states in bold alert banners.',
      renderDemo: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <ObservationCard
            observation={{
              observationId: 'OBS-101',
              plateId: 'CULT-1',
              readAt: new Date().toISOString(),
              readBy: 'John Miller',
              colonyCount: 'Abundant growth',
              morphology: 'Beta-hemolytic circular colonies',
              gramReaction: 'Gram Positive',
              isContaminated: false
            }}
          />
          <QcIndicator strainName="Escherichia coli ATCC 25922" passed qcDate="2026-07-04" />
          <QcIndicator strainName="Staphylococcus aureus ATCC 29213" passed={false} qcDate="2026-07-04" />
        </div>
      )
    },
    spacer: {
      name: 'Spacer',
      cmpId: 'CMP-106',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    elevation: {
      name: 'Elevation',
      cmpId: 'CMP-109',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    statusindicator: {
      name: 'Status Indicator',
      cmpId: 'CMP-110',
      purpose: 'Fully Implemented',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)' }}>Fully Implemented. Render placeholder for Status Indicator.</div>
    },

    chip: {
      name: 'Chip',
      cmpId: 'CMP-205',
      purpose: 'Fully Implemented',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)' }}>Fully Implemented. Render placeholder for Chip.</div>
    },
    tag: {
      name: 'Tag',
      cmpId: 'CMP-206',
      purpose: 'Fully Implemented',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)' }}>Fully Implemented. Render placeholder for Tag.</div>
    },

    progressindicator: {
      name: 'Progress Indicator',
      cmpId: 'CMP-209',
      purpose: 'Fully Implemented',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)' }}>Fully Implemented. Render placeholder for Progress Indicator.</div>
    },
    skeleton: {
      name: 'Skeleton',
      cmpId: 'CMP-211',
      purpose: 'Fully Implemented',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)' }}>Fully Implemented. Render placeholder for Skeleton.</div>
    },

    radiobutton: {
      name: 'Radio Button',
      cmpId: 'CMP-213',
      purpose: 'Fully Implemented',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)' }}>Fully Implemented. Render placeholder for Radio Button.</div>
    },
    toggleswitch: {
      name: 'Toggle Switch',
      cmpId: 'CMP-214',
      purpose: 'Fully Implemented',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)' }}>Fully Implemented. Render placeholder for Toggle Switch.</div>
    },
    textarea: {
      name: 'Text Area',
      cmpId: 'CMP-302',
      purpose: 'Fully Implemented',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)' }}>Fully Implemented. Render placeholder for Text Area.</div>
    },
    numberinput: {
      name: 'Number Input',
      cmpId: 'CMP-303',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    datetimepicker: {
      name: 'Date Time Picker',
      cmpId: 'CMP-306',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    selectdropdown: {
      name: 'Select Dropdown',
      cmpId: 'CMP-307',
      purpose: 'Fully Implemented',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)' }}>Fully Implemented. Render placeholder for Select Dropdown.</div>
    },

    typeahead: {
      name: 'Typeahead',
      cmpId: 'CMP-309',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    controlledvocab: {
      name: 'Controlled Vocab',
      cmpId: 'CMP-310',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },

    signaturefield: {
      name: 'Signature Field',
      cmpId: 'CMP-312',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    searchbox: {
      name: 'Search Box',
      cmpId: 'CMP-313',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    passwordfield: {
      name: 'Password Field',
      cmpId: 'CMP-314',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    otpinput: {
      name: 'OTP Input',
      cmpId: 'CMP-315',
      purpose: 'Deferred',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-status-warning)', color: 'var(--color-text-secondary)' }}>Deferred for future release.</div>
    },
    formsection: {
      name: 'Form Section',
      cmpId: 'CMP-316',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    formwizard: {
      name: 'Form Wizard',
      cmpId: 'CMP-317',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    actionbar: {
      name: 'Action Bar',
      cmpId: 'CMP-318',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    timeline: {
      name: 'Timeline',
      cmpId: 'CMP-402',
      purpose: 'Fully Implemented',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)' }}>Fully Implemented. Render placeholder for Timeline.</div>
    },

    statisticcard: {
      name: 'Statistic Card',
      cmpId: 'CMP-404',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    emptystate: {
      name: 'Empty State',
      cmpId: 'CMP-405',
      purpose: 'Fully Implemented',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)' }}>Fully Implemented. Render placeholder for Empty State.</div>
    },
    errorstate: {
      name: 'Error State',
      cmpId: 'CMP-406',
      purpose: 'Fully Implemented',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)' }}>Fully Implemented. Render placeholder for Error State.</div>
    },
    loadingstate: {
      name: 'Loading State',
      cmpId: 'CMP-407',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    informationcard: {
      name: 'Information Card',
      cmpId: 'CMP-409',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    auditcard: {
      name: 'Audit Card',
      cmpId: 'CMP-410',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    activityfeed: {
      name: 'Activity Feed',
      cmpId: 'CMP-411',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    reportviewer: {
      name: 'Report Viewer',
      cmpId: 'CMP-412',
      purpose: 'Deferred',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-status-warning)', color: 'var(--color-text-secondary)' }}>Deferred for future release.</div>
    },
    pdfpreview: {
      name: 'PDF Preview',
      cmpId: 'CMP-413',
      purpose: 'Deferred',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-status-warning)', color: 'var(--color-text-secondary)' }}>Deferred for future release.</div>
    },
    barcodepreview: {
      name: 'Barcode Preview',
      cmpId: 'CMP-414',
      purpose: 'Deferred',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-status-warning)', color: 'var(--color-text-secondary)' }}>Deferred for future release.</div>
    },
    validationpanel: {
      name: 'Validation Panel',
      cmpId: 'CMP-502',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    workflowprogress: {
      name: 'Workflow Progress',
      cmpId: 'CMP-503',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    timelinepanel: {
      name: 'Timeline Panel',
      cmpId: 'CMP-504',
      purpose: 'Fully Implemented',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)' }}>Fully Implemented. Render placeholder for Timeline Panel.</div>
    },
    recordlock: {
      name: 'Record Lock',
      cmpId: 'CMP-505',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    slaindicator: {
      name: 'SLA Indicator',
      cmpId: 'CMP-506',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    taskassign: {
      name: 'Task Assign',
      cmpId: 'CMP-507',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    qualityreview: {
      name: 'Quality Review',
      cmpId: 'CMP-508',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    exceptionpanel: {
      name: 'Exception Panel',
      cmpId: 'CMP-509',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    escalationpanel: {
      name: 'Escalation Panel',
      cmpId: 'CMP-510',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    sidebar: {
      name: 'Sidebar',
      cmpId: 'CMP-601',
      purpose: 'Fully Implemented',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)' }}>Fully Implemented. Render placeholder for Sidebar.</div>
    },
    header: {
      name: 'Header',
      cmpId: 'CMP-602',
      purpose: 'Fully Implemented',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)' }}>Fully Implemented. Render placeholder for Header.</div>
    },
    breadcrumb: {
      name: 'Breadcrumb',
      cmpId: 'CMP-603',
      purpose: 'Fully Implemented',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)' }}>Fully Implemented. Render placeholder for Breadcrumb.</div>
    },
    contextbar: {
      name: 'Context Bar',
      cmpId: 'CMP-604',
      purpose: 'Fully Implemented',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)' }}>Fully Implemented. Render placeholder for Context Bar.</div>
    },
    workspacelayout: {
      name: 'Workspace Layout',
      cmpId: 'CMP-605',
      purpose: 'Fully Implemented',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)' }}>Fully Implemented. Render placeholder for Workspace Layout.</div>
    },

    quickactions: {
      name: 'Quick Actions',
      cmpId: 'CMP-607',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    commandpalette: {
      name: 'Command Palette',
      cmpId: 'CMP-608',
      purpose: 'Fully Implemented',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)' }}>Fully Implemented. Render placeholder for Command Palette.</div>
    },
    globalsearch: {
      name: 'Global Search',
      cmpId: 'CMP-609',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    notificationctr: {
      name: 'Notification Ctr',
      cmpId: 'CMP-610',
      purpose: 'Fully Implemented',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)' }}>Fully Implemented. Render placeholder for Notification Ctr.</div>
    },
    dialog: {
      name: 'Dialog',
      cmpId: 'CMP-701',
      purpose: 'Fully Implemented',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)' }}>Fully Implemented. Render placeholder for Dialog.</div>
    },
    drawer: {
      name: 'Drawer',
      cmpId: 'CMP-702',
      purpose: 'Fully Implemented',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)' }}>Fully Implemented. Render placeholder for Drawer.</div>
    },
    wizard: {
      name: 'Wizard',
      cmpId: 'CMP-703',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    toast: {
      name: 'Toast',
      cmpId: 'CMP-704',
      purpose: 'Fully Implemented',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)' }}>Fully Implemented. Render placeholder for Toast.</div>
    },
    alertbanner: {
      name: 'Alert Banner',
      cmpId: 'CMP-705',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    confirmation: {
      name: 'Confirmation',
      cmpId: 'CMP-706',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    deletedialog: {
      name: 'Delete Dialog',
      cmpId: 'CMP-707',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    warningdialog: {
      name: 'Warning Dialog',
      cmpId: 'CMP-708',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    criticaldialog: {
      name: 'Critical Dialog',
      cmpId: 'CMP-709',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    previewdrawer: {
      name: 'Preview Drawer',
      cmpId: 'CMP-710',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    specimencard: {
      name: 'Specimen Card',
      cmpId: 'CMP-801',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    specimentline: {
      name: 'Specimen T-Line',
      cmpId: 'CMP-802',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    mictable: {
      name: 'MIC Table',
      cmpId: 'CMP-805',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    antibiogramgrid: {
      name: 'Antibiogram Grid',
      cmpId: 'CMP-806',
      purpose: 'Deferred',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-status-warning)', color: 'var(--color-text-secondary)' }}>Deferred for future release.</div>
    },
    organismsummary: {
      name: 'Organism Summary',
      cmpId: 'CMP-807',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    colonycounter: {
      name: 'Colony Counter',
      cmpId: 'CMP-808',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    incubationtimer: {
      name: 'Incubation Timer',
      cmpId: 'CMP-809',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    qcresultcard: {
      name: 'QC Result Card',
      cmpId: 'CMP-810',
      purpose: 'Fully Implemented',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)' }}>Fully Implemented. Render placeholder for QC Result Card.</div>
    },
    capapanel: {
      name: 'CAPA Panel',
      cmpId: 'CMP-811',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    medialotcard: {
      name: 'Media Lot Card',
      cmpId: 'CMP-812',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
    equipmentstatus: {
      name: 'Equipment Status',
      cmpId: 'CMP-813',
      purpose: 'Implemented via Composition',
      states: 'N/A',
      patterns: 'N/A',
      a11y: 'N/A',
      shortcuts: 'N/A',
      guidelines: 'Refer to LIMS-DOC-14.',
      renderDemo: () => <div style={{ padding: '1rem', border: '1px dashed var(--color-border-default)', color: 'var(--color-text-secondary)' }}>Implemented via Composition. See LIMS-DOC-14B.</div>
    },
  };

  const selectedCmp = componentsRegistry[selectedComponentId];

  return (
    <div style={playbookStyles.layout}>
      {/* Sidebar Controls */}
      <aside style={playbookStyles.sidebar}>
        <h2 style={playbookStyles.sidebarTitle}>Visual QA Registry</h2>
        <div style={playbookStyles.categoryNav}>
          {(['foundation', 'form', 'layout', 'data', 'overlay', 'laboratory'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                // Auto-select first component in category
                const firstId = Object.keys(componentsRegistry).find(key => {
                  if (cat === 'foundation') return ['button','iconbutton','typography','badge','avatar','divider','spacer','container','surface','elevation','statusindicator','chip','tag','tooltip','spinner','link']  .includes(key);
                  if (cat === 'form') return ['textinput','textarea','numberinput','datepicker','timepicker','datetimepicker','select','selectdropdown','multiselect','typeahead','controlledvocab','fileupload','signaturefield','searchbox','passwordfield','otpinput','formsection','formwizard','actionbar','checkbox','radiobutton','toggleswitch'].includes(key);
                  if (cat === 'layout') return ['card','accordion','skeleton','progressindicator','validationpanel','workflowprogress','timelinepanel','recordlock','slaindicator','taskassign','qualityreview','exceptionpanel','escalationpanel','sidebar','header','breadcrumb','contextbar','workspacelayout','tabs','quickactions','globalsearch'].includes(key);
                  if (cat === 'data') return ['datatable','timeline','kpicard','statisticcard','emptystate','errorstate','loadingstate','informationcard','auditcard','activityfeed','reportviewer','pdfpreview','barcodepreview'].includes(key);
                  if (cat === 'overlay') return ['modal','signaturefield','commandpalette','notificationctr','dialog','drawer','wizard','toast','alertbanner','confirmation','deletedialog','warningdialog','criticaldialog','previewdrawer'].includes(key);
                  return ['specimencard','specimentline','observation','astmatrix','mictable','antibiogramgrid','organismsummary','colonycounter','incubationtimer','qcresultcard','capapanel','medialotcard','equipmentstatus'].includes(key);
                });
                if (firstId) setSelectedComponentId(firstId);
              }}
              style={{
                ...playbookStyles.categoryBtn,
                backgroundColor: activeCategory === cat ? 'var(--color-surface-hover)' : 'transparent',
                fontWeight: activeCategory === cat ? 600 : 500
              }}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        <Divider />

        <div style={playbookStyles.componentsList}>
          {Object.entries(componentsRegistry)
            .filter(([key]) => {
              if (activeCategory === 'foundation') return ['button','iconbutton','typography','badge','avatar','divider','spacer','container','surface','elevation','statusindicator','chip','tag','tooltip','spinner','link'].includes(key);
              if (activeCategory === 'form') return ['textinput','textarea','numberinput','datepicker','timepicker','datetimepicker','select','selectdropdown','multiselect','typeahead','controlledvocab','fileupload','signaturefield','searchbox','passwordfield','otpinput','formsection','formwizard','actionbar','checkbox','radiobutton','toggleswitch'].includes(key);
              if (activeCategory === 'layout') return ['card','accordion','skeleton','validationpanel','workflowprogress','timelinepanel','recordlock','slaindicator','taskassign','qualityreview','exceptionpanel','escalationpanel','sidebar','header','breadcrumb','contextbar','workspacelayout','tabs','quickactions','globalsearch'].includes(key);
              if (activeCategory === 'data') return ['datatable','timeline','kpicard','statisticcard','emptystate','errorstate','loadingstate','informationcard','auditcard','activityfeed','reportviewer','pdfpreview','barcodepreview'].includes(key);
              if (activeCategory === 'overlay') return ['modal','commandpalette','notificationctr','dialog','drawer','wizard','toast','alertbanner','confirmation','deletedialog','warningdialog','criticaldialog','previewdrawer','progressindicator'].includes(key);
              return ['specimencard','specimentline','observation','astmatrix','mictable','antibiogramgrid','organismsummary','colonycounter','incubationtimer','qcresultcard','capapanel','medialotcard','equipmentstatus'].includes(key);
            })
            .map(([key, value]) => (
              <button
                key={key}
                onClick={() => setSelectedComponentId(key)}
                style={{
                  ...playbookStyles.componentBtn,
                  backgroundColor: selectedComponentId === key ? 'var(--color-brand-primary)' : 'transparent',
                  color: selectedComponentId === key ? 'white' : 'var(--color-text-primary)'
                }}
              >
                <span>{value.name}</span>
                <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>{value.cmpId}</span>
              </button>
            ))}
        </div>
      </aside>

      {/* Interactive Main Area */}
      <main style={playbookStyles.main}>
        {selectedCmp ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            {/* Header Title block */}
            <div style={playbookStyles.header}>
              <div>
                <h1 style={{ font: 'var(--type-heading-page)', margin: 0 }}>{selectedCmp.name}</h1>
                <p style={{ font: 'var(--type-body-small)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Enterprise Component Spec Profile
                </p>
              </div>
              <span style={playbookStyles.cmpIdBadge}>{selectedCmp.cmpId}</span>
            </div>

            {/* QA Controls */}
            <div style={playbookStyles.qaControls}>
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                <span style={{ font: 'var(--type-label-default)' }}>Visual Theme:</span>
                <Button variant="outline" onClick={toggleTheme}>
                  Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
                </Button>
              </div>
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                <span style={{ font: 'var(--type-label-default)' }}>Density:</span>
                {(['comfortable', 'compact', 'high-density'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDensity(d)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: density === d ? 'var(--color-brand-primary)' : 'transparent',
                      color: density === d ? 'white' : 'var(--color-text-primary)',
                      border: '1px solid var(--color-border-default)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Documentation Matrix */}
            <Card elevation={1} style={playbookStyles.docCard}>
              <h3 style={{ font: 'var(--type-heading-subsection)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>
                Compliance & QA Audit Specifications
              </h3>
              <div style={playbookStyles.docGrid}>
                <div style={playbookStyles.docItem}>
                  <strong>Purpose:</strong>
                  <span>{selectedCmp.purpose}</span>
                </div>
                <div style={playbookStyles.docItem}>
                  <strong>Supported States:</strong>
                  <span>{selectedCmp.states}</span>
                </div>
                <div style={playbookStyles.docItem}>
                  <strong>Interaction Patterns:</strong>
                  <span>{selectedCmp.patterns}</span>
                </div>
                <div style={playbookStyles.docItem}>
                  <strong>Accessibility Notes:</strong>
                  <span>{selectedCmp.a11y}</span>
                </div>
                <div style={playbookStyles.docItem}>
                  <strong>Keyboard Shortcuts:</strong>
                  <span>{selectedCmp.shortcuts}</span>
                </div>
                <div style={playbookStyles.docItem}>
                  <strong>Reuse Guidelines:</strong>
                  <span>{selectedCmp.guidelines}</span>
                </div>
              </div>
            </Card>

            {/* Render Component States */}
            <Card elevation={2} style={playbookStyles.demoCard}>
              <h3 style={{ font: 'var(--type-heading-subsection)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
                Visual States Matrix (Live Rendering)
              </h3>
              <div style={playbookStyles.renderContainer}>
                {selectedCmp.renderDemo()}
              </div>
            </Card>
          </div>
        ) : (
          <div style={playbookStyles.emptyPalette}>
            <span style={{ fontSize: '3rem' }}>⚙️</span>
            <p>Select a LIMS-DOC-14 component registry ID to audit states.</p>
          </div>
        )}
      </main>
    </div>
  );
};

const playbookStyles: Record<string, React.CSSProperties> = {
  layout: {
    display: 'flex',
    minHeight: '80vh',
    width: '100%',
    backgroundColor: 'var(--color-surface-base)'
  },
  sidebar: {
    width: '280px',
    borderRight: '1px solid var(--color-border-default)',
    padding: 'var(--spacing-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)',
    backgroundColor: 'var(--color-surface-raised)'
  },
  sidebarTitle: {
    font: 'var(--type-heading-subsection)',
    color: 'var(--color-text-primary)'
  },
  categoryNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  categoryBtn: {
    padding: '8px 12px',
    border: 'none',
    textAlign: 'left',
    font: 'var(--type-body-small)',
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
    borderRadius: 'var(--radius-sm)'
  },
  componentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    overflowY: 'auto',
    flexGrow: 1
  },
  componentBtn: {
    padding: '8px 12px',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    textAlign: 'left',
    font: 'var(--type-body-small)',
    fontWeight: 500
  },
  main: {
    flexGrow: 1,
    padding: 'var(--spacing-lg)',
    overflowY: 'auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--color-border-default)',
    paddingBottom: 'var(--spacing-sm)'
  },
  cmpIdBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.875rem',
    fontWeight: 600,
    backgroundColor: 'var(--color-brand-primary-bg)',
    color: 'var(--color-brand-primary)',
    padding: '4px 12px',
    borderRadius: 'var(--radius-circular)',
    border: '1px solid var(--color-brand-primary)'
  },
  qaControls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 'var(--spacing-sm) var(--spacing-md)',
    backgroundColor: 'var(--color-surface-raised)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-sm)'
  },
  docCard: {
    backgroundColor: 'var(--color-surface-raised)'
  },
  docGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 'var(--spacing-md)'
  },
  docItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    fontSize: '0.85rem'
  },
  demoCard: {
    backgroundColor: 'var(--color-surface-raised)'
  },
  renderContainer: {
    padding: 'var(--spacing-md)',
    border: '1px dashed var(--color-border-default)',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--color-surface-base)'
  },
  demoGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-md)'
  },
  emptyPalette: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
    gap: 'var(--spacing-md)',
    color: 'var(--color-text-secondary)'
  }
};
