interface History {
   void pushState(Object stateObj, String title, String URL);
   void replaceState(Object stateObj, String title, String URL);
};

[Global]
interface Window {
	readonly attribute History history;
};
