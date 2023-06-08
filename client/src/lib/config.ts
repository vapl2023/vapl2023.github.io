export const PROD = !!document.location.host;
export const SERVER_URL = PROD
	? "https://vapl2023.adaptable.app"
	: "http://localhost:8080";
