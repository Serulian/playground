interface Location {
    readonly attribute String origin;
    readonly attribute String pathname;
};

[Global]
interface Window {
	readonly attribute Location location;
};
