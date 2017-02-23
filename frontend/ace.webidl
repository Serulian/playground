interface ace {
	static aceEditor edit(Element element);
};

interface aceEditor {
	aceSession getSession();
	void setTheme(String theme);
	void setReadOnly(boolean readOnly);
};

interface aceMode {};

interface aceSession {
	void on(String eventName, any handler);
	String getValue();
	void setValue(String value);
	void setMode(aceMode mode);
};
