// FIREBASE 
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
  getFirestore, collection, doc, setDoc, getDoc, updateDoc, onSnapshot, increment
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDFupTxHBzWZcjdwhkbcVIVlPxGOhJJ45w",
  authDomain: "neko-bd67b.firebaseapp.com",
  projectId: "neko-bd67b",
  storageBucket: "neko-bd67b.firebasestorage.app",
  messagingSenderId: "197031620656",
  appId: "1:197031620656:web:7e6cb1fd66cb65f610fdf5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// VUE
const myApp = Vue.createApp({
  data() {
    return {
      userId: 'user_001',
      user: { username: null, coins: 100 },
      cats: [],
      nameInput: '',
      selectedAction: null,
      catTypes: ['black', 'white', 'calico', 'brown', 'tabby', 'tiger', 'siamese']
    };
  },
  methods: {
    async fetchUser() {
      const ref = doc(db, 'users', this.userId);
      const snap = await getDoc(ref);
      if (snap.exists()) this.user = snap.data();
      else await setDoc(ref, this.user);
    },
    setupRealtimeCats() {
      const ref = collection(db, 'cats');
      onSnapshot(ref, snapshot => {
        this.cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      });
    },
    setAction(actionType) {
      this.selectedAction = actionType;
    },
    async handleDrop(cat) {
      if (!this.selectedAction) return;
      const userRef = doc(db, 'users', this.userId);
      const catRef = doc(db, 'cats', cat.id);
      const rewards = {
        pet: { exp: 5, coins: 2, status: 'sitting' },
        play: { exp: 10, coins: 3, status: 'playing' },
        feed: { exp: 15, coins: 5, status: 'eating' }
      };
      const reward = rewards[this.selectedAction];
      if (!reward) return;
      const mood = (this.selectedAction === 'pet' && cat.status === 'sleeping') ? 'annoyed' : 'happy';
      const newExp = (cat.exp || 0) + reward.exp;
      const levelUp = newExp >= 50 && cat.level < 2;
      await updateDoc(catRef, {
        mood,
        exp: increment(reward.exp),
        status: reward.status,
        isStray: levelUp ? false : cat.isStray,
        level: levelUp ? 2 : cat.level,
        lastInteraction: this.selectedAction
      });
      await updateDoc(userRef, { coins: increment(reward.coins) });
      setTimeout(() => updateDoc(catRef, { status: 'sitting' }), 10000);
      this.selectedAction = null;
    },
    async addNewCat() {
      if (this.user.coins < 50) return alert("Not enough coins!");
      const userRef = doc(db, 'users', this.userId);
      const randomKey = this.catTypes[Math.floor(Math.random() * this.catTypes.length)];
      const newCat = {
        name: null,
        key: randomKey,
        mood: "neutral",
        isStray: true,
        level: 1,
        exp: 0,
        interaction: "none",
        status: "sitting"
      };
      await setDoc(doc(collection(db, 'cats')), newCat);
      await updateDoc(userRef, { coins: increment(-50) });
    },
    catAnimation(cat) {
      if (cat.status === 'sleeping') return 'sleep';
      if (cat.status === 'playing') return 'play';
      if (cat.mood === 'annoyed') return 'run';
      return 'idle';
    },
    getCatStyle(cat, index) {
      let top = cat.status === 'sleeping' ? 730 : 820;
      let left = cat.isStray ? 100 + index * 120 : 800 + index * 120;
      return { top: top + 'px', left: left + 'px' };
    },
    getAccessoryStyle(cat) {
      return {
        top: cat.status === 'sleeping' ? '720px' : '830px',
        left: cat.isStray ? '100px' : '800px',
        transition: 'top 0.3s, left 0.3s'
      };
    }
  },
  mounted() {
    this.fetchUser();
    this.setupRealtimeCats();
  }
});

myApp.component("cat-sprite", {
  props: ["cat", "animation"],
  computed: {
    spritePath() {
      const keyCapitalized = this.cat.key.charAt(0).toUpperCase() + this.cat.key.slice(1);
      const fileMap = {
        idle: `${keyCapitalized}Idle.gif`,
        run: `${keyCapitalized}Walking.gif`,
        sleep: `${keyCapitalized}Sleeping.gif`,
        play: `${keyCapitalized}Playing.gif`,
        sit: `${keyCapitalized}Sitting.gif`
      };
      return `./neko_assets/${keyCapitalized}/${fileMap[this.animation] || fileMap.idle}`;
    }
  },
  template: `
    <img 
      :src="spritePath"
      :alt="cat.name || 'cat'"
      class="cat-sprite"
    />
  `
});

myApp.mount("#myApp");