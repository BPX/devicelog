// STRESS TEST — Paste this in browser console while logged into Trackstack
// Generates 100 employees + 100 assets instantly

// 100 employees
const names = ['John Smith','Jane Doe','Bob Wilson','Alice Chen','Mike Brown','Sarah Davis','Tom Lee','Emma White','James Kim','Lisa Park','David Mueller','Anna Weber','Marco Rossi','Sophie Dubois','Lars Nielsen','Eva Johansson','Carlos Garcia','Maria Lopez','Hans Fischer','Olga Petrova','Raj Patel','Yuki Tanaka','Andre Dupont','Fatima Ali','Chen Wei','Pierre Martin','Ingrid Olsen','Pedro Silva','Nina Kowalski','Omar Hassan','Klaus Schmidt','Helga Bauer','Giovanni Bianchi','Hiroshi Sato','Amelie Bernard','Sven Eriksson','Beat Keller','Rosa Fernandez','Jan Novak','Katarina Horvath','Ahmed Khalil','Leila Mansour','Dmitri Volkov','Natasha Orlova','Bjorn Larsson','Freja Andersen','Ole Hansen','Mette Poulsen','Per Nilsson','Erika Lund'];
for (let i = 50; i < 100; i++) names.push('Employee ' + i);

// Save employees + custom settings
const settings = JSON.parse(localStorage.getItem('trackstack_settings') || '{}');
settings.employees = names;
settings.categories = ['laptop','desktop','monitor','phone','tablet','server','printer','network','software','license','other'];
settings.statuses = ['active','maintenance','retired','lost','in repair','ready to deploy','decommissioned'];
localStorage.setItem('trackstack_settings', JSON.stringify(settings));

// 100 assets
const categories = ['laptop','desktop','monitor','phone','tablet','server'];
const statuses = ['active','active','active','active','active','maintenance','ready to deploy','decommissioned'];
const locations = ['Zurich Office','Geneva Office','Bern HQ','Basel Lab','Lugano Remote','Winterthur'];
const makes = [['Dell','XPS 15'],['Apple','MacBook Pro 14'],['Lenovo','ThinkPad X1'],['HP','EliteBook'],['Dell','Latitude'],['Apple','MacBook Air'],['Lenovo','ThinkCentre'],['HP','ProDesk'],['Dell','OptiPlex'],['Apple','Mac mini']];

const assets = [];
for (let i = 0; i < 100; i++) {
  const m = makes[i % makes.length];
  const cat = categories[i % categories.length];
  const d = new Date();
  d.setDate(d.getDate() + Math.floor(Math.random() * 730));
  assets.push({
    id: 'stress-' + i,
    name: m[0] + ' ' + m[1] + ' #' + (i+1),
    category: cat,
    manufacturer: m[0],
    model: m[1],
    serial_number: 'SN' + Math.random().toString(36).slice(2,10).toUpperCase(),
    status: statuses[i % statuses.length],
    assigned_to: names[i % names.length],
    location: locations[i % locations.length],
    purchase_date: '2024-' + String(Math.floor(Math.random()*12)+1).padStart(2,'0') + '-01',
    warranty_expires: d.toISOString().split('T')[0],
  });
}
localStorage.setItem('trackstack_assets', JSON.stringify(assets));

// 20 certificates
const certs = [];
for (let i = 0; i < 20; i++) {
  const d = new Date();
  d.setDate(d.getDate() + Math.floor(Math.random() * 365) - 30);
  certs.push({
    id: 'cert-' + i,
    name: ['trackstack.com SSL','mail server cert','VPN cert','Office 365 license','Adobe CC license','Atlassian Jira license','Slack license','Zoom license','Google Workspace','AWS support contract'][i % 10] + (i>9?' #2':''),
    type: ['ssl_cert','ssl_cert','ssl_cert','software_license','software_license','software_license','software_license','software_license','software_license','support_contract'][i % 10],
    issuer: ["Let's Encrypt","DigiCert","Sectigo","Microsoft","Adobe","Atlassian","Slack","Zoom","Google","AWS"][i % 10],
    expires_at: d.toISOString().split('T')[0],
    notify_before_days: 30,
  });
}
localStorage.setItem('trackstack_certificates', JSON.stringify(certs));

console.log('✅ 100 assets, 100 employees, 20 certificates injected. Refresh the page.');
