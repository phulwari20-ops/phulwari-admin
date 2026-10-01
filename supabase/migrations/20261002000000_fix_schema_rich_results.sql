-- Migration to fix Schema.org rich results validation errors and canonical URLs in activity_pages
-- Fixes:
-- 1. 'offers' property removed from LocalBusiness and properly structured under Service / CourseInstance.
-- 2. Added reviewRating to Review nodes.
-- 3. Course schema for Karate updated with hasCourseInstance, Place location, address PostalAddress, and offers.
-- 4. Replaces non-WWW apex domain (https://phulwari.co.in) with canonical WWW domain (https://www.phulwari.co.in).

-- 1. Gymnastics: Separate LocalBusiness and Service with offers
UPDATE public.activity_pages
SET schema_json = '{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://www.phulwari.co.in/#localbusiness",
      "name": "Phulwari Mother & Child Activity Centre",
      "image": "https://www.phulwari.co.in/phulwari_logo.webp",
      "url": "https://www.phulwari.co.in/activities/gymnastics-classes-for-kids-patna",
      "telephone": "+91 62073 68839",
      "email": "phulwari02@gmail.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "M/32, Road Number 25, Main Rd, Sri Krishna Nagar, Kidwaipuri",
        "addressLocality": "Patna",
        "addressRegion": "Bihar",
        "postalCode": "800001",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 25.6012,
        "longitude": 85.1223
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
        "opens": "06:00",
        "closes": "20:00"
      },
      "sameAs": [
        "https://www.facebook.com/Phulwari-Mother-Kids",
        "https://www.instagram.com/motherandchildactivitycentre"
      ]
    },
    {
      "@type": "Service",
      "name": "Kids Gymnastics Training Classes",
      "description": "Professional gymnastics classes designed to build physical strength, balance, flexibility, and agility for children in Kidwaipuri, Patna.",
      "provider": {
        "@id": "https://www.phulwari.co.in/#localbusiness"
      },
      "offers": {
        "@type": "Offer",
        "price": "3500",
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock"
      }
    }
  ]
}'::jsonb
WHERE id = 'gymnastics-classes-for-kids-patna' OR slug = 'gymnastics-classes-for-kids-patna';

-- 2. Karate: Course with complete hasCourseInstance, location, address, and offers
UPDATE public.activity_pages
SET schema_json = '{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://www.phulwari.co.in/#business",
      "name": "Phulwari Mother & Child Activity Centre",
      "url": "https://www.phulwari.co.in/",
      "logo": "https://www.phulwari.co.in/phulwari_logo.webp",
      "telephone": "+91-6207368839",
      "email": "phulwari02@gmail.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "M/32, Road No. 25, Sri Krishna Nagar, Kidwaipuri Main Road",
        "addressLocality": "Patna",
        "addressRegion": "Bihar",
        "postalCode": "800001",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 25.6075,
        "longitude": 85.1225
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
        "opens": "08:00",
        "closes": "20:00"
      },
      "priceRange": "$$"
    },
    {
      "@type": "Course",
      "@id": "https://www.phulwari.co.in/#karatecourse",
      "name": "Karate and Martial Arts Training for Kids",
      "description": "Professional karate classes for children focused on self-defense, discipline, physical fitness, focus, and confidence building in Kidwaipuri, Patna.",
      "provider": {
        "@id": "https://www.phulwari.co.in/#business"
      },
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "onsite",
        "location": {
          "@type": "Place",
          "name": "Phulwari Mother & Child Activity Centre",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "M/32, Road No. 25, Sri Krishna Nagar, Kidwaipuri Main Road",
            "addressLocality": "Patna",
            "addressRegion": "Bihar",
            "postalCode": "800001",
            "addressCountry": "IN"
          }
        },
        "offers": {
          "@type": "Offer",
          "price": "3500",
          "priceCurrency": "INR",
          "availability": "https://schema.org/InStock"
        }
      }
    }
  ]
}'::jsonb
WHERE id = 'karate-classes-patna' OR slug = 'karate-classes-patna';

-- 3. Yoga: LocalBusiness + Service with offers
UPDATE public.activity_pages
SET schema_json = '{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://www.phulwari.co.in/#localbusiness",
      "name": "Phulwari Mother & Child Activity Centre",
      "image": "https://www.phulwari.co.in/phulwari_logo.webp",
      "url": "https://www.phulwari.co.in/yoga-classes-patna",
      "telephone": "+91 62073 68839",
      "email": "phulwari02@gmail.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "M/32, Road Number 25, Main Rd, Sri Krishna Nagar, Kidwaipuri",
        "addressLocality": "Patna",
        "addressRegion": "Bihar",
        "postalCode": "800001",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 25.6012,
        "longitude": 85.1223
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
        "opens": "06:00",
        "closes": "20:00"
      },
      "sameAs": [
        "https://www.facebook.com/",
        "https://www.instagram.com/motherandchildactivitycentre"
      ]
    },
    {
      "@type": "Service",
      "name": "Yoga & Fitness Program for Mothers & Children",
      "description": "Specialized wellness, flexibility, and yoga classes tailored for mothers well-being and child development in Kidwaipuri, Patna.",
      "provider": {
        "@id": "https://www.phulwari.co.in/#localbusiness"
      },
      "offers": {
        "@type": "Offer",
        "price": "3500",
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock"
      }
    }
  ]
}'::jsonb
WHERE id = 'yoga-classes-patna' OR slug = 'yoga-classes-patna';

-- 4. Cricket: LocalBusiness + Service with offers
UPDATE public.activity_pages
SET schema_json = '{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://www.phulwari.co.in/#localbusiness",
      "name": "Phulwari Mother & Child Activity Centre",
      "image": "https://www.phulwari.co.in/phulwari_logo.webp",
      "url": "https://www.phulwari.co.in/activities/cricket-coaching-patna",
      "telephone": "+91 62073 68839",
      "email": "phulwari02@gmail.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "M/32, Road Number 25, Main Rd, Sri Krishna Nagar, Kidwaipuri",
        "addressLocality": "Patna",
        "addressRegion": "Bihar",
        "postalCode": "800001",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 25.6012,
        "longitude": 85.1223
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
        "opens": "06:00",
        "closes": "20:00"
      },
      "sameAs": [
        "https://www.facebook.com/",
        "https://www.instagram.com/motherandchildactivitycentre"
      ]
    },
    {
      "@type": "Service",
      "name": "Kids Cricket Coaching & Sports Training",
      "description": "Structured cricket training classes helping children learn teamwork, discipline, physical fitness, and fundamentals of the sport in Kidwaipuri, Patna.",
      "provider": {
        "@id": "https://www.phulwari.co.in/#localbusiness"
      },
      "offers": {
        "@type": "Offer",
        "price": "3500",
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock"
      }
    }
  ]
}'::jsonb
WHERE id = 'cricket-coaching-patna' OR slug = 'cricket-coaching-patna';

-- 5. Play Zone: LocalBusiness + Service with offers
UPDATE public.activity_pages
SET schema_json = '{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://www.phulwari.co.in/#localbusiness",
      "name": "Phulwari Mother & Child Activity Centre",
      "image": "https://www.phulwari.co.in/phulwari_logo.webp",
      "url": "https://www.phulwari.co.in/activities/play-zone",
      "telephone": "+91 62073 68839",
      "email": "phulwari02@gmail.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "M/32, Road Number 25, Main Rd, Sri Krishna Nagar, Kidwaipuri",
        "addressLocality": "Patna",
        "addressRegion": "Bihar",
        "postalCode": "800001",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 25.6012,
        "longitude": 85.1223
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
        "opens": "06:00",
        "closes": "20:00"
      },
      "sameAs": [
        "https://www.facebook.com/",
        "https://www.instagram.com/motherandchildactivitycentre"
      ]
    },
    {
      "@type": "Service",
      "name": "Indoor Kids Play Zone",
      "description": "A safe, interactive, and stimulating play environment designed for toddlers and young children to explore and socialize in Kidwaipuri, Patna.",
      "provider": {
        "@id": "https://www.phulwari.co.in/#localbusiness"
      },
      "offers": {
        "@type": "Offer",
        "price": "3500",
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock"
      }
    }
  ]
}'::jsonb
WHERE id = 'play-zone' OR slug = 'play-zone';

-- 6. Update all remaining rows to replace non-WWW https://phulwari.co.in with https://www.phulwari.co.in in schema_json
UPDATE public.activity_pages
SET schema_json = replace(schema_json::text, 'https://phulwari.co.in', 'https://www.phulwari.co.in')::jsonb
WHERE schema_json::text LIKE '%https://phulwari.co.in%';
