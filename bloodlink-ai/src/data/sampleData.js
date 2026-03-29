/**
 * BloodLink AI – Sample Data
 * 
 * Pre-populated donors and hospital location data for demo purposes.
 * Locations are set around Mumbai, India for realistic demo.
 */

// Hospital location (center point for demo – Mumbai)
export const HOSPITAL_LOCATION = {
  lat: 19.0760,
  lng: 72.8777,
  name: 'BloodLink Central Hospital',
};

// Sample donors scattered around the hospital within ~25km
export const SAMPLE_DONORS = [
  {
    id: 'donor-1',
    name: 'Aarav Sharma',
    bloodGroup: 'O+',
    location: { lat: 19.0825, lng: 72.8906 },
    available: true,
    phone: '+91 98765 43210',
    lastDonated: '2025-12-15',
  },
  {
    id: 'donor-2',
    name: 'Priya Patel',
    bloodGroup: 'A+',
    location: { lat: 19.0543, lng: 72.8401 },
    available: true,
    phone: '+91 98765 43211',
    lastDonated: '2026-01-20',
  },
  {
    id: 'donor-3',
    name: 'Rohan Desai',
    bloodGroup: 'B+',
    location: { lat: 19.1176, lng: 72.9060 },
    available: true,
    phone: '+91 98765 43212',
    lastDonated: '2026-02-10',
  },
  {
    id: 'donor-4',
    name: 'Sneha Kulkarni',
    bloodGroup: 'O-',
    location: { lat: 19.0368, lng: 72.8565 },
    available: true,
    phone: '+91 98765 43213',
    lastDonated: '2025-11-30',
  },
  {
    id: 'donor-5',
    name: 'Vikram Singh',
    bloodGroup: 'AB+',
    location: { lat: 19.0990, lng: 72.8483 },
    available: true,
    phone: '+91 98765 43214',
    lastDonated: '2026-03-01',
  },
  {
    id: 'donor-6',
    name: 'Meera Joshi',
    bloodGroup: 'A-',
    location: { lat: 19.0660, lng: 72.8340 },
    available: true,
    phone: '+91 98765 43215',
    lastDonated: '2026-01-05',
  },
  {
    id: 'donor-7',
    name: 'Arjun Reddy',
    bloodGroup: 'B-',
    location: { lat: 19.1050, lng: 72.8770 },
    available: true,
    phone: '+91 98765 43216',
    lastDonated: '2025-10-22',
  },
  {
    id: 'donor-8',
    name: 'Kavya Nair',
    bloodGroup: 'O+',
    location: { lat: 19.0440, lng: 72.8200 },
    available: true,
    phone: '+91 98765 43217',
    lastDonated: '2026-02-28',
  },
  {
    id: 'donor-9',
    name: 'Rahul Mehta',
    bloodGroup: 'A+',
    location: { lat: 19.0900, lng: 72.9100 },
    available: true,
    phone: '+91 98765 43218',
    lastDonated: '2026-03-10',
  },
  {
    id: 'donor-10',
    name: 'Divya Iyer',
    bloodGroup: 'AB-',
    location: { lat: 19.0580, lng: 72.8690 },
    available: true,
    phone: '+91 98765 43219',
    lastDonated: '2025-12-01',
  },
  // Far-away donors (outside 20km to test filter)
  {
    id: 'donor-11',
    name: 'Suresh Kumar',
    bloodGroup: 'O+',
    location: { lat: 19.2940, lng: 72.8540 },
    available: true,
    phone: '+91 98765 43220',
    lastDonated: '2026-01-15',
  },
  {
    id: 'donor-12',
    name: 'Anita Verma',
    bloodGroup: 'A+',
    location: { lat: 18.9220, lng: 72.8350 },
    available: true,
    phone: '+91 98765 43221',
    lastDonated: '2026-02-05',
  },
];

// Blood group options for forms
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Urgency levels
export const URGENCY_LEVELS = ['Normal', 'Urgent', 'Critical'];
