# Requirements Document

## Introduction

This document specifies the requirements for a Breakdown/Roadside Emergency Page for the Mekh platform. The feature enables drivers experiencing vehicle emergencies to quickly connect with verified nearby technicians through an optimized, server-side processed workflow designed for low-bandwidth and low-processing-power devices.

## Glossary

- **Client**: A user of the Mekh platform who needs roadside assistance
- **Technician**: A verified service provider registered on the Mekh platform
- **Emergency System**: The complete roadside emergency booking system
- **Server-Side Processing**: All filtering, sorting, distance calculations, and ETA computations performed on the backend/database before sending results to the client
- **ETA**: Estimated Time of Arrival
- **Atomic Transaction**: A database operation that completes entirely or not at all, preventing partial data writes
- **Service Category**: Classification of technician services (Mechanical & Repair or Towing)
- **Geospatial Query**: Database query using latitude/longitude coordinates to find nearby technicians

## Requirements

### Requirement 1

**User Story:** As a driver experiencing a vehicle emergency, I want to quickly describe my situation and location, so that I can get immediate help from nearby verified technicians.

#### Acceptance Criteria

1. WHEN a client visits the emergency page THEN the Emergency System SHALL display a hero section with headline "Car Stuck? Get Verified Roadside Help Fast." and a "Get Help Now" call-to-action button
2. WHEN a client selects their situation THEN the Emergency System SHALL accept one selection from the predefined options: Won't start, Tyre puncture, Overheating, Strange Noise or Smoke, Accident/Towing, Battery issue, Fuel, Locked out, Stuck in Mud/Ditch, or Other Problem
3. WHEN a client grants location permission THEN the Emergency System SHALL auto-detect the client's GPS coordinates and populate the location field
4. WHEN a client enters vehicle details THEN the Emergency System SHALL require vehicle make/model, transmission type (Automatic or Manual), fuel type (Petrol, Diesel, or Hybrid), and a description of what happened
5. WHEN a client indicates vehicle mobility THEN the Emergency System SHALL accept one selection: "Yes, it can move", "Barely / risky to drive", or "No, completely stuck"

### Requirement 2

**User Story:** As a client on a slow internet connection with a low-powered device, I want the system to process all technician matching on the server, so that I receive results quickly without my device performing heavy computations.

#### Acceptance Criteria

1. WHEN the Emergency System processes a client request THEN the Emergency System SHALL perform all location-based filtering using server-side geospatial queries on stored technician latitude/longitude coordinates
2. WHEN the Emergency System filters technicians by service category THEN the Emergency System SHALL apply the filter in the database query: "Mechanical & Repair" when the client selected "Yes, it can move", or "Towing" when the client selected "Barely / risky to drive" or "No, completely stuck"
3. WHEN the Emergency System sorts technicians THEN the Emergency System SHALL sort results by proximity in the database query before returning results to the client
4. WHEN the Emergency System returns technician results THEN the Emergency System SHALL limit the response to a maximum of 4 technicians from the database query
5. WHEN the Emergency System calculates ETA THEN the Emergency System SHALL compute estimated arrival time on the server using technician and client coordinates with an average speed assumption and return the pre-calculated ETA value in the API response

### Requirement 3

**User Story:** As a client viewing emergency results, I want to see nearby technicians immediately with their estimated arrival times, so that I can quickly choose help without additional waiting or processing.

#### Acceptance Criteria

1. WHEN the Emergency System displays technician results THEN the Emergency System SHALL show a "Nearby Technicians" heading with up to 4 technician cards
2. WHEN the Emergency System renders technician information THEN the Emergency System SHALL use the existing TechnicianCard component to display each technician
3. WHEN the Emergency System presents the results page THEN the Emergency System SHALL convey the feeling that "Help is already being arranged" rather than a generic browse page
4. WHEN a client views a technician card THEN the Emergency System SHALL display the pre-calculated ETA value received from the server without performing any client-side computation

### Requirement 4

**User Story:** As a client who has selected a technician, I want to contact them immediately via phone or WhatsApp with my emergency details pre-filled, so that I can communicate my situation quickly without retyping information.

#### Acceptance Criteria

1. WHEN a client clicks a technician card and opens the profile page and clicks the Book button THEN the Emergency System SHALL display a Call button and a WhatsApp button
2. WHEN a client clicks the Call button THEN the Emergency System SHALL redirect to the device's phone dialer with the technician's phone number pre-filled
3. WHEN a client clicks the WhatsApp button THEN the Emergency System SHALL open WhatsApp with a pre-assembled message containing: client name, situation selection, client location, vehicle make/model, transmission type, fuel type, what happened description, and vehicle mobility status
4. WHEN the Emergency System assembles the WhatsApp message THEN the Emergency System SHALL construct the message string on the server and return it ready-to-use in the API response
5. WHEN a client clicks either the Call or WhatsApp button after pressing Book THEN the Emergency System SHALL save the booking to the database in a single atomic transaction

### Requirement 5

**User Story:** As a technician, I want to receive immediate notification when a client books me for an emergency, so that I can respond quickly to their urgent need.

#### Acceptance Criteria

1. WHEN a booking is saved to the database THEN the Emergency System SHALL trigger a new lead notification to the technician using the existing lead notification email system
2. WHEN a booking is created THEN the Emergency System SHALL make the booking appear in the client's My Bookings section
3. WHEN the Emergency System saves booking data THEN the Emergency System SHALL store all fields in a single atomic transaction including: situation selected, client location (text and coordinates), vehicle details, what happened description, mobility status, technician booked, pre-calculated ETA, tow truck number plate (if applicable), and booking timestamp

### Requirement 6

**User Story:** As a client who has completed a booking, I want to see immediate confirmation with all relevant details and status updates, so that I know help is on the way and what to expect.

#### Acceptance Criteria

1. WHEN a client completes a booking THEN the Emergency System SHALL return a single confirmation response object containing: technician name, business name, phone number, situation details, pre-calculated ETA, tow truck number plate (if client indicated stuck), and status updates
2. WHEN the Emergency System displays booking confirmation THEN the Emergency System SHALL show the information directly without additional processing or API calls on the client side
3. WHEN the Emergency System presents confirmation THEN the Emergency System SHALL display status updates showing "Request received" and "Arriving soon"
4. WHEN the Emergency System shows confirmation THEN the Emergency System SHALL convey the feeling that "Help is already being arranged"

### Requirement 7

**User Story:** As a client viewing the emergency page, I want to see typical pricing information and safety tips, so that I can understand costs and stay safe while waiting for help.

#### Acceptance Criteria

1. WHEN a client views the emergency page THEN the Emergency System SHALL display a "Typical Emergency Service Pricing" section showing service types and price ranges: Battery Jumpstart (KSh 1,500 – 3,000), Tyre Assistance (KSh 1,000 – 2,500), Fuel Delivery (KSh 1,500 + fuel), Emergency Diagnosis (KSh 2,000 – 5,000), and Towing (KSh 3,000 – 15,000)
2. WHEN the Emergency System displays pricing THEN the Emergency System SHALL include a disclaimer stating that final pricing depends on location, vehicle type, time of day, and issue severity
3. WHEN a client views the emergency page THEN the Emergency System SHALL display a "Stay Safe While You Wait" section with safety tips including: turn on hazard lights, move off the road if safe, place warning triangle, stay inside at night, avoid random towing offers, and share location with someone trusted
4. WHEN the Emergency System detects highway location THEN the Emergency System SHALL display an alert banner stating "You appear to be on a highway. Stay visible and avoid standing near moving traffic."
5. WHEN a client views the emergency page THEN the Emergency System SHALL display a "Why Drivers Use Mekh During Emergencies" section highlighting: verified technicians only, no random roadside referrals, phone and WhatsApp support, upfront pricing guidance, and towing/mobile mechanic support

### Requirement 8

**User Story:** As a client in an emergency situation, I want quick access to emergency contact numbers, so that I can reach police, medical services, or platform support if needed.

#### Acceptance Criteria

1. WHEN a client views the emergency page THEN the Emergency System SHALL display an "Emergency Contacts" section with: Police (999 / 112), Kenya Red Cross (1199), AA Kenya, and Mekh Support Line (0738242743)

### Requirement 9

**User Story:** As a system administrator, I want all database queries for the emergency page to be optimized with proper indexing, so that the system responds quickly even under high load.

#### Acceptance Criteria

1. WHEN the Emergency System performs database queries THEN the Emergency System SHALL use indexed columns for service category filtering
2. WHEN the Emergency System performs database queries THEN the Emergency System SHALL use indexed columns for technician coordinate lookups
3. WHEN the Emergency System stores booking data THEN the Emergency System SHALL ensure all booking fields are saved without requiring secondary writes or updates after the initial save
