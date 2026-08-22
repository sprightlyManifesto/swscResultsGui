/**
 * autocomplete.js
 *
 * Creates an autocomplete dropdown for an input element.
 *
 * Usage:
 *
 *     const options = [
 *         "Apple",
 *         "Apricot",
 *         "Banana",
 *         "Blueberry",
 *         "Cherry"
 *     ];
 *
 *     setupAutocomplete("#myInput", options);
 *
 * Or:
 *
 *     setupAutocomplete(
 *         document.getElementById("myInput"),
 *         options
 *     );
 */


function setupAutocomplete(input, options, config = {}) {
    // Allow either a CSS selector or an actual input element
    const inputElement =
        typeof input === "string"
            ? document.querySelector(input)
            : input;

    if (!inputElement) {
        console.error("Autocomplete: input element not found.");
        return;
    }

    if (!Array.isArray(options)) {
        console.error("Autocomplete: options must be an array.");
        return;
    }

    // Configuration
    const settings = {
        maxResults: 10,
        minCharacters: 1,
        ...config
    };

    // Make sure the input is inside a positioned container
    // so the dropdown can be positioned correctly.
    const wrapper = document.createElement("div");
    wrapper.className = "autocomplete-wrapper";

    inputElement.parentNode.insertBefore(wrapper, inputElement);
    wrapper.appendChild(inputElement);

    // Create the dropdown
    const dropdown = document.createElement("div");
    dropdown.className = "autocomplete-dropdown";
    dropdown.style.display = "none";

    wrapper.appendChild(dropdown);

    let selectedIndex = -1;
    let currentResults = [];

    /**
     * Escape HTML so option text cannot inject HTML into the page.
     */
    function escapeHtml(text) {
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /**
     * Highlight the part of an option that matches the search.
     */
    function highlightMatch(text, search) {
        const escapedText = escapeHtml(text);

        if (!search) {
            return escapedText;
        }

        const escapedSearch = escapeHtml(search);

        const regex = new RegExp(
            `(${escapedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
            "gi"
        );

        return escapedText.replace(
            regex,
            "<strong>$1</strong>"
        );
    }

    /**
     * Find matching options.
     */
    function findMatches(search) {
        const query = search.trim().toLowerCase();

        if (query.length < settings.minCharacters) {
            return [];
        }

        return options
            .filter(option =>
                String(option)
                    .toLowerCase()
                    .includes(query)
            )
            .slice(0, settings.maxResults);
    }

    /**
     * Display the dropdown.
     */
    function showResults(results) {
        currentResults = results;
        selectedIndex = -1;

        dropdown.innerHTML = "";

        if (results.length === 0) {
            dropdown.style.display = "none";
            return;
        }

        const search = inputElement.value;

        results.forEach((option, index) => {
            const item = document.createElement("div");

            item.className = "autocomplete-option";
            item.dataset.index = index;

            item.innerHTML = highlightMatch(
                String(option),
                search
            );

            // Mouse interaction
            item.addEventListener("mousedown", function (event) {
                // Prevent the input's blur event happening first
                event.preventDefault();

                selectOption(index);
            });

            dropdown.appendChild(item);
        });

        dropdown.style.display = "block";
    }

    /**
     * Select an option.
     */
    function selectOption(index) {
        if (
            index < 0 ||
            index >= currentResults.length
        ) {
            return;
        }

        inputElement.value = currentResults[index];

        hideResults();

        // Let the page know that an autocomplete option was selected
        inputElement.dispatchEvent(
            new CustomEvent("autocomplete:selected", {
                detail: {
                    value: currentResults[index]
                }
            })
        );
    }

    /**
     * Hide the dropdown.
     */
    function hideResults() {
        dropdown.style.display = "none";
        selectedIndex = -1;
    }

    /**
     * Highlight the currently selected item.
     */
    function updateSelection() {
        const items = dropdown.querySelectorAll(
            ".autocomplete-option"
        );

        items.forEach((item, index) => {
            item.classList.toggle(
                "selected",
                index === selectedIndex
            );
        });

        // Scroll selected item into view
        if (selectedIndex >= 0 && items[selectedIndex]) {
            items[selectedIndex].scrollIntoView({
                block: "nearest"
            });
        }
    }

    /**
     * Input event.
     */
    inputElement.addEventListener("input", function () {
        const results = findMatches(inputElement.value);
        showResults(results);
    });

    /**
     * Keyboard navigation.
     */
    inputElement.addEventListener("keydown", function (event) {
        if (dropdown.style.display === "none") {
            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();

            if (currentResults.length === 0) {
                return;
            }

            selectedIndex++;

            if (selectedIndex >= currentResults.length) {
                selectedIndex = 0;
            }

            updateSelection();
        }

        else if (event.key === "ArrowUp") {
            event.preventDefault();

            if (currentResults.length === 0) {
                return;
            }

            selectedIndex--;

            if (selectedIndex < 0) {
                selectedIndex = currentResults.length - 1;
            }

            updateSelection();
        }

        else if (event.key === "Enter") {
            if (selectedIndex >= 0) {
                event.preventDefault();
                selectOption(selectedIndex);
            }
        }

        else if (event.key === "Escape") {
            hideResults();
        }
    });

    /**
     * Show results again when the input receives focus.
     */
    inputElement.addEventListener("focus", function () {
        const results = findMatches(inputElement.value);

        if (results.length > 0) {
            showResults(results);
        }
    });

    /**
     * Hide dropdown when clicking elsewhere.
     */
    document.addEventListener("mousedown", function (event) {
        if (!wrapper.contains(event.target)) {
            hideResults();
        }
    });

    /**
     * Basic styling.
     *
     * This is added automatically so you don't need a separate CSS file.
     */
    if (!document.getElementById("autocomplete-styles")) {
        const style = document.createElement("style");

        style.id = "autocomplete-styles";

        style.textContent = `
            .autocomplete-wrapper {
                position: relative;
                display: inline-block;
                width: 100%;
            }

            .autocomplete-dropdown {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                max-height: 250px;
                overflow-y: auto;
                background: ##292929;
                border: 1px solid #ccc;
                border-top: none;
                box-sizing: border-box;
                z-index: 9999;
                font-family: inherit;
            }

            .autocomplete-option {
                padding: 8px 12px;
                cursor: pointer;
                background: #292929;
            }

            .autocomplete-option:hover,
            .autocomplete-option.selected {
                background: #444;
            }

            .autocomplete-option strong {
                font-weight: bold;
            }
        `;

        document.head.appendChild(style);
    }

    // Return useful methods in case the caller wants to control it
    return {
        show: () => showResults(findMatches(inputElement.value)),
        hide: hideResults,
        refresh: () => showResults(findMatches(inputElement.value))
    };
}

/*
```
### Example HTML

<!DOCTYPE html>
<html>
<head>
    <title>Autocomplete Example</title>
</head>

<body>

    <input
        id="myInput"
        type="text"
        placeholder="Start typing..."
    >

    <script src="autocomplete.js"></script>

    <script>
        const options = [
            "Apple",
            "Apricot",
            "Avocado",
            "Banana",
            "Blackberry",
            "Blueberry",
            "Cherry",
            "Coconut",
            "Grape",
            "Kiwi",
            "Lemon",
            "Mango",
            "Orange",
            "Peach",
            "Pear",
            "Pineapple",
            "Raspberry",
            "Strawberry",
            "Watermelon"
        ];

        setupAutocomplete("#myInput", options);
    </script>

</body>
</html>

You can also change the maximum number of results:

javascript
setupAutocomplete("#myInput", options, {
    maxResults: 20,
    minCharacters: 2
});

And you can detect when the user actually selects an option:

javascript
document
    .querySelector("#myInput")
    .addEventListener("autocomplete:selected", function (event) {
        console.log("Selected:", event.detail.value);
    });

```

This version uses **case-insensitive partial matching**, so typing `app` will find `"Apple"`, while typing `berry` will find `"Blackberry"`, `"Blueberry"`, and `"Strawberry"`. It also supports **mouse selection, ↑/↓ keyboard navigation, Enter, Escape, result limiting, and HTML-safe option rendering**.
*/