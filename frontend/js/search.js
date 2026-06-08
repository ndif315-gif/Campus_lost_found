document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('globalSearchForm');
    const input = document.getElementById('globalSearchInput');
    const results = document.getElementById('searchResults');
    const status = document.getElementById('searchStatus');
    const clearButton = document.getElementById('clearSearchBtn');

    if (!form || !input || !results) {
        return;
    }

    const setStatus = (message) => {
        if (status) {
            status.textContent = message;
        }
    };

    const toItemUrl = (item) => item.image_path || item.image_url || '';

    const renderEmpty = (message) => {
        results.innerHTML = `
            <div class="search-empty-state">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <h3>${message}</h3>
            </div>
        `;
    };

    const renderResults = (items, queryLabel) => {
        if (!items.length) {
            renderEmpty(queryLabel ? `No results found for “${queryLabel}”.` : 'No items available yet.');
            return;
        }

        results.innerHTML = items.map((item) => {
            const isLost = item.kind === 'lost';
            const location = isLost ? item.last_seen_location : item.found_location;
            const badgeLabel = isLost ? 'Lost' : 'Found';
            const badgeClass = isLost ? 'lost' : 'found';
            const imageUrl = toItemUrl(item) ? `${Config.API_URL}${toItemUrl(item)}` : '';
            const createdAt = item.created_at ? new Date(item.created_at).toLocaleDateString() : '';

            return `
                <article class="search-result-card">
                    <div class="search-result-media">
                        ${imageUrl
                            ? `<img src="${imageUrl}" alt="${item.item_name}">`
                            : `<div class="search-result-placeholder"><svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></div>`}
                    </div>
                    <div class="search-result-body">
                        <div class="search-result-top">
                            <span class="result-badge ${badgeClass}">${badgeLabel}</span>
                            <span class="search-result-date">${createdAt}</span>
                        </div>
                        <h3>${item.item_name}</h3>
                        <p>${item.description || 'No description provided.'}</p>
                        <div class="search-result-meta">
                            <span>${item.category || 'Uncategorized'}</span>
                            <span>${location || 'Location not listed'}</span>
                        </div>
                    </div>
                </article>
            `;
        }).join('');
    };

    const loadPublicItems = async () => {
        setStatus('Showing recent posted items');
        renderEmpty('Loading items...');

        try {
            const [lostResponse, foundResponse] = await Promise.all([
                fetch(`${Config.API_URL}/lost`),
                fetch(`${Config.API_URL}/found`)
            ]);

            const [lostPayload, foundPayload] = await Promise.all([
                lostResponse.json(),
                foundResponse.json()
            ]);

            const lostItems = (lostPayload.items || []).slice(0, 4).map(item => ({ ...item, kind: 'lost' }));
            const foundItems = (foundPayload.items || []).slice(0, 4).map(item => ({ ...item, kind: 'found' }));
            const merged = [...lostItems, ...foundItems].sort((left, right) => {
                return new Date(right.created_at || 0) - new Date(left.created_at || 0);
            });

            renderResults(merged, '');
        } catch (error) {
            console.error('Failed to load public items:', error);
            renderEmpty('Unable to load items right now.');
            setStatus('Try again in a moment');
        }
    };

    const searchItems = async (query) => {
        const trimmedQuery = query.trim();

        if (!trimmedQuery) {
            loadPublicItems();
            return;
        }

        if (trimmedQuery.length < 2) {
            renderEmpty('Enter at least 2 characters to search.');
            setStatus('Search input is too short');
            return;
        }

        setStatus(`Searching for “${trimmedQuery}”`);
        renderEmpty('Searching...');

        try {
            const [lostResponse, foundResponse] = await Promise.all([
                fetch(`${Config.API_URL}/lost/search?q=${encodeURIComponent(trimmedQuery)}`),
                fetch(`${Config.API_URL}/found/search?q=${encodeURIComponent(trimmedQuery)}`)
            ]);

            const [lostPayload, foundPayload] = await Promise.all([
                lostResponse.json(),
                foundResponse.json()
            ]);

            const lostItems = (lostPayload.items || []).map(item => ({ ...item, kind: 'lost' }));
            const foundItems = (foundPayload.items || []).map(item => ({ ...item, kind: 'found' }));
            const merged = [...lostItems, ...foundItems].sort((left, right) => {
                return new Date(right.created_at || 0) - new Date(left.created_at || 0);
            });

            renderResults(merged, trimmedQuery);
        } catch (error) {
            console.error('Search failed:', error);
            renderEmpty('Search failed. Please try again.');
            setStatus('Search unavailable right now');
        }
    };

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        searchItems(input.value);
    });

    if (clearButton) {
        clearButton.addEventListener('click', () => {
            input.value = '';
            loadPublicItems();
        });
    }

    loadPublicItems();
});
