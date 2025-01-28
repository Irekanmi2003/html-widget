class HtmlState {
    constructor(initialValue, options = {}) {
        this.value = initialValue; // Current state
        this.listeners = new Set(); // List of subscribers
        this.middleware = []; // Middleware stack
        this.options = options; // Configuration options
        this.storage =
        this.options.storageType === 'sessionStorage'
        ? sessionStorage
        : localStorage;

        if (this.options.persist && this.options.storageKey) {
            this.loadFromStorage();
        }

        if (this.options.enableLogging) {
            console.log('[HtmlState] Initialized with state:', this.value);
        }
    }

    /**
     * Subscribe to state changes.
     * @param {function} listener - Callback function invoked on state updates.
     * @returns {function} Unsubscribe function to remove the listener.
     */
    subscribe(listener) {
        this.listeners.add(listener);
        // Immediately call listener with the current state
        listener(this.value);

        return () => this.listeners.delete(listener);
    }

    /**
     * Add middleware to the stack.
     * @param {function} middleware - Middleware function to process state updates.
     */
    use(middleware) {
        this.middleware.push(middleware);
    }

    /**
     * Update the state.
     * @param {object} newState - Partial state to merge into the current state.
     */
    async update(newState) {
        const oldState = this.value;
        let nextState = { ...oldState, ...newState };

        // Process middleware stack
        for (const mw of this.middleware) {
            try {
                nextState = await mw(nextState, oldState);
            } catch (error) {
                console.error('[HtmlState] Middleware error:', error);
            }
        }

        // Prevent unnecessary updates
        if (JSON.stringify(nextState) !== JSON.stringify(this.value)) {
            this.value = nextState;
            this.notifyListeners();
            this.saveToStorage();
        }
    }

    /**
     * Notify all listeners of state changes.
     */
    notifyListeners() {
        for (const listener of this.listeners) {
            try {
                listener(this.value);
            } catch (error) {
                console.error('[HtmlState] Listener error:', error);
            }
        }
    }

    /**
     * Load state from storage if persistence is enabled.
     */
    loadFromStorage() {
        if (!this.storage || !this.options.storageKey) return;

        try {
            const storedValue = this.storage.getItem(this.options.storageKey);
            if (storedValue) {
                this.value = JSON.parse(storedValue);
            }
        } catch (error) {
            console.error('[HtmlState] Failed to load state from storage:', error);
        }
    }

    /**
     * Save state to storage if persistence is enabled.
     */
    saveToStorage() {
        if (!this.storage || !this.options.storageKey) return;

        try {
            this.storage.setItem(this.options.storageKey, JSON.stringify(this.value));
        } catch (error) {
            console.error('[HtmlState] Failed to save state to storage:', error);
        }
    }
}
