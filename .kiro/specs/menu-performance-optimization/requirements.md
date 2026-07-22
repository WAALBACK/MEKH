# Requirements Document

## Introduction

This document outlines the requirements for optimizing the performance of menu pages across the AutoGearKe application. The goal is to reduce loading times to under 1 second by implementing efficient data fetching strategies, local caching, optimized image delivery, and improved real-time connection handling for users on slow networks or low-end devices.

## Glossary

- **Menu Pages**: The MenuPage, TechnicianMenuPage, GuestMenuPage, and ClientProfilePage components that display user profile information and navigation options
- **App Shell**: The static HTML/CSS structure that renders immediately before dynamic content loads
- **Skeleton Screen**: Placeholder UI elements (gray pulsing boxes) that indicate content is loading
- **Session Storage**: Browser-based temporary storage that persists data for the duration of a browser session
- **WebSocket**: A persistent connection protocol used for real-time data updates
- **Cloudinary**: The image hosting and optimization service used for profile photos and media
- **User Context**: A React Context that stores and provides user data throughout the application
- **Supabase Client**: The JavaScript client library used to interact with the Supabase backend

## Requirements

### Requirement 1

**User Story:** As a user with slow internet, I want the menu to appear instantly with placeholder content, so that I feel the app is responsive even while data loads.

#### Acceptance Criteria

1. WHEN a user navigates to any menu page THEN the system SHALL display the app shell with skeleton screens within 100 milliseconds
2. WHEN the app shell renders THEN the system SHALL show gray pulsing placeholder boxes for the profile photo and business name
3. WHEN skeleton screens are displayed THEN the system SHALL maintain the existing white background and blue header styling
4. WHEN dynamic data arrives THEN the system SHALL replace skeleton screens with actual content smoothly
5. WHEN the user has a cached profile THEN the system SHALL display cached data immediately while fetching fresh data in the background

### Requirement 2

**User Story:** As a technician or client, I want my profile data to be cached locally after login, so that menu pages load instantly without repeated database queries.

#### Acceptance Criteria

1. WHEN a user successfully logs in THEN the system SHALL fetch and store their complete profile data in session storage
2. WHEN storing profile data THEN the system SHALL include profile information, notifications count, and user role
3. WHEN a menu page loads THEN the system SHALL read profile data from session storage before making any network requests
4. WHEN cached data exists THEN the system SHALL display it immediately and optionally refresh in the background
5. WHEN the user logs out THEN the system SHALL clear all cached profile data from session storage

### Requirement 3

**User Story:** As a developer, I want to use a single optimized query to fetch all menu-related data, so that I reduce the number of database round trips and improve performance.

#### Acceptance Criteria

1. WHEN fetching menu data THEN the system SHALL use a single database query to retrieve profile, notifications, and settings data
2. WHEN the query executes THEN the system SHALL select only the required fields to minimize payload size
3. WHEN the query completes THEN the system SHALL cache the result in session storage with a timestamp
4. WHEN multiple menu pages need the same data THEN the system SHALL reuse the cached result without additional queries
5. WHEN cached data is older than 5 minutes THEN the system SHALL fetch fresh data from the database

### Requirement 4

**User Story:** As a user on a mobile device, I want profile images to load quickly, so that I don't waste bandwidth or wait for large images to download.

#### Acceptance Criteria

1. WHEN displaying a profile icon in the menu THEN the system SHALL request a Cloudinary thumbnail with dimensions 100x100 pixels
2. WHEN constructing Cloudinary URLs THEN the system SHALL include transformation parameters "w_100,h_100,c_fill"
3. WHEN rendering the profile image THEN the system SHALL add loading="eager" and fetchpriority="high" attributes
4. WHEN the transformed image is requested THEN the system SHALL receive a file size under 10KB
5. WHEN larger profile images are needed elsewhere THEN the system SHALL request appropriately sized versions for each context

### Requirement 5

**User Story:** As a user with poor internet connectivity, I want the app to handle real-time connections gracefully, so that my device doesn't drain battery trying to maintain failing WebSocket connections.

#### Acceptance Criteria

1. WHEN the system detects slow internet THEN the system SHALL disable WebSocket connections for real-time notifications
2. WHEN WebSockets are disabled THEN the system SHALL fall back to polling every 60 seconds
3. WHEN a WebSocket connection is pending for more than 5 seconds THEN the system SHALL abort the connection and use polling
4. WHEN using polling mode THEN the system SHALL provide a pull-to-refresh gesture for manual updates
5. WHEN internet speed improves THEN the system SHALL re-enable WebSocket connections automatically

### Requirement 6

**User Story:** As a developer, I want to implement a centralized User Context provider, so that user data is available throughout the app without prop drilling or repeated fetches.

#### Acceptance Criteria

1. WHEN the app initializes THEN the system SHALL create a User Context provider at the root level
2. WHEN a user logs in THEN the system SHALL populate the User Context with their profile data
3. WHEN any component needs user data THEN the system SHALL access it from the User Context
4. WHEN user data changes THEN the system SHALL update the User Context and persist changes to session storage
5. WHEN the User Context updates THEN the system SHALL notify all subscribed components to re-render

### Requirement 7

**User Story:** As a user, I want all my data cached locally after the first load, so that subsequent navigation is instant and the app feels native.

#### Acceptance Criteria

1. WHEN the user first loads the app THEN the system SHALL cache profile, notifications, and frequently accessed data
2. WHEN caching data THEN the system SHALL use session storage for temporary data and local storage for persistent preferences
3. WHEN the user navigates between pages THEN the system SHALL serve cached data instantly
4. WHEN cached data becomes stale THEN the system SHALL refresh it in the background without blocking the UI
5. WHEN storage quota is exceeded THEN the system SHALL remove the oldest cached entries first

### Requirement 8

**User Story:** As a user on a low-end device, I want the app to prioritize critical resources, so that the most important content loads first.

#### Acceptance Criteria

1. WHEN the app loads THEN the system SHALL prioritize loading the app shell CSS and critical JavaScript
2. WHEN images are rendered THEN the system SHALL use appropriate loading attributes based on viewport position
3. WHEN the profile image is in the viewport THEN the system SHALL use loading="eager" and fetchpriority="high"
4. WHEN images are below the fold THEN the system SHALL use loading="lazy"
5. WHEN fonts are loaded THEN the system SHALL use font-display: swap to prevent blocking text rendering
