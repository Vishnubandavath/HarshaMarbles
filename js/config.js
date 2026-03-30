/**
 * Global site configuration — update Formspree ID before going live.
 */
const CONFIG = {
  businessName: "Harsha Naik Marble Polishing Services",
  phone: "916303415748",
  whatsapp: "916303415748",
  /** Opens Google Maps at the business address */
  maps:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(
      "812/Ll/52, Alhamra Colony, Ap Animal Husbandry Employees Colony, Shaikpet, Hyderabad 500008, Telangana"
    ),
  /** Replace YOUR_ID with your Formspree form ID */
  formEndpoint: "https://formspree.io/f/xjgpywqr",
  address:
    "812/Ll/52, Alhamra Colony, Ap Animal Husbandry Employees Colony, Shaikpet, Hyderabad – 500008, Telangana",
  addressShort: "Shaikpet, Hyderabad – 500008",
  city: "Hyderabad, Telangana",
  rating: 4.5,
};
