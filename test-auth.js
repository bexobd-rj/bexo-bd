const event = 'INITIAL_SESSION';
const session = null;
if (session && session.user) {
    console.log("Logged in");
} else if (event === 'SIGNED_OUT') {
    console.log("Cleared local storage");
} else {
    console.log("Did nothing! Stale local storage remains!");
}
