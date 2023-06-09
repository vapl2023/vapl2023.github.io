<<<<<<< HEAD
export const SERVER_URL = "ws://98.145.176.117:8080";
=======
export const PROD = !!document.location.host;
export const SERVER_URL = PROD
	? "https://vapl2023.adaptable.app"
	: "http://localhost:8080";
>>>>>>> refs/remotes/origin/main
