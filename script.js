// FIRESTORE BOILERPLATE --------------- //
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
	getFirestore // etc. etc.
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

const firebaseConfig = {
	apiKey: "### APIKEY ###",
	authDomain: "### YOURPROJECT.firebaseapp.com ###",
	projectId: "### YOURPROJECT ###"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore();


// VUE BOILERPLATE -------------------- //
const myApp = Vue.createApp({
	data() {
		return {};
	},
	computed: {},
	methods: {},
	mounted() {}
});

// CUSTOM COMPONENTS -------------------- //
myApp.component("my-custom", {
	props: [],
	data() {
		return {};
	},
	template: ``
});

myApp.mount("#myApp");
