document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('info-form');
    const itemList = document.getElementById('item-list');

    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(form);
            const data = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                item: formData.get('item')
            };

            try {
                const response = await fetch('/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    alert('Information submitted successfully!');
                    form.reset();
                    fetchItems(); // Refresh item list after submission
                } else {
                    alert('Failed to submit information.');
                }
            } catch (error) {
                console.error('Error submitting information:', error);
                alert('An error occurred while submitting information.');
            }
        });
    }

    async function fetchItems() {
        try {
            const response = await fetch('/items');
            const items = await response.json();

            itemList.innerHTML = ''; // Clear existing items

            items.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.name}</td>
                    <td>${item.phone}</td>
                    <td>${item.item}</td>
                    <td>
                        <button class="buy-button" data-id="${item._id}" ${item.status === 'pending' ? 'disabled' : ''}>
                            ${item.status === 'pending' ? 'Pending' : 'Buy'}
                        </button>
                        ${item.status === 'pending' && item.seller === 'currentUserId' ? `
                            <button class="deal-button" data-id="${item._id}" data-decision="yes">Yes Deal</button>
                            <button class="deal-button" data-id="${item._id}" data-decision="no">No Deal</button>
                        ` : ''}
                    </td>
                `;
                itemList.appendChild(row);
            });
        } catch (err) {
            console.error('Error fetching items:', err);
        }
    }

    async function initiatePurchase(itemId) {
        try {
            const response = await fetch('/purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ itemId: itemId, userId: 'currentUserId' }) // Replace with actual user ID
            });

            if (response.ok) {
                alert('Purchase initiated successfully!');
                fetchItems(); // Refresh item list
            } else {
                alert('Failed to initiate purchase.');
            }
        } catch (error) {
            console.error('Error initiating purchase:', error);
            alert('An error occurred while initiating the purchase.');
        }
    }

    async function finalizeDeal(itemId, decision) {
        try {
            const response = await fetch('/finalize-deal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ itemId: itemId, decision: decision })
            });

            if (response.ok) {
                alert('Deal finalized successfully!');
                fetchItems(); // Refresh item list
            } else {
                alert('Failed to finalize deal.');
            }
        } catch (error) {
            console.error('Error finalizing deal:', error);
            alert('An error occurred while finalizing the deal.');
        }
    }

    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('buy-button')) {
            const itemId = event.target.dataset.id;
            initiatePurchase(itemId);
        }
        if (event.target.classList.contains('deal-button')) {
            const itemId = event.target.dataset.id;
            const decision = event.target.dataset.decision;
            finalizeDeal(itemId, decision);
        }
    });

    if (window.location.pathname === '/display-info.html') {
        fetchItems();
        setInterval(fetchItems, 5000); // Refresh the data every 5 seconds
    }
});
