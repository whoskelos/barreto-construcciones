function initNavSlider() {
    const desktopNav = document.getElementById('desktop-nav');
    const slider = desktopNav?.querySelector('.nav-bg-slider');
    const navLinks = desktopNav?.querySelectorAll('.nav-link');

    if (!slider || !navLinks || navLinks.length === 0) return;

    // Encontrar el link activo
    const activeLink = Array.from(navLinks).find(link => 
        link.classList.contains('text-primary-600')
    );

    // Función para mover el slider
    const moveSlider = (link: Element) => {
        const rect = link.getBoundingClientRect();
        const navRect = desktopNav!.getBoundingClientRect();
        
        if (slider instanceof HTMLElement) {
            slider.style.width = `${rect.width}px`;
            slider.style.height = `${rect.height}px`;
            slider.style.left = `${rect.left - navRect.left}px`;
            slider.style.top = `${rect.top - navRect.top}px`;
            slider.style.opacity = '1';
        }
    };

    // Posicionar el slider en el elemento activo al cargar
    if (activeLink) {
        moveSlider(activeLink);
    }

    // Añadir event listeners a cada link
    navLinks.forEach((link) => {
        link.addEventListener('mouseenter', () => {
            moveSlider(link);
        });
    });

    // Volver al elemento activo cuando el mouse sale del nav
    desktopNav?.addEventListener('mouseleave', () => {
        if (activeLink) {
            moveSlider(activeLink);
        } else if (slider instanceof HTMLElement) {
            slider.style.opacity = '0';
        }
    });
}

function initMobileMenu() {
    // Mobile menu toggle
    const menuButton = document.getElementById("mobile-menu-button");
    const mobileMenu = document.getElementById("mobile-menu");
    const menuIcon = document.getElementById("menu-icon");
    const closeIcon = document.getElementById("close-icon");

    // Function to close mobile menu
    const closeMobileMenu = () => {
        const currentMenuButton = document.getElementById("mobile-menu-button");
        const currentMobileMenu = document.getElementById("mobile-menu");
        const currentMenuIcon = document.getElementById("menu-icon");
        const currentCloseIcon = document.getElementById("close-icon");
        
        if (currentMenuButton && currentMobileMenu && currentMenuIcon && currentCloseIcon) {
            currentMenuButton.setAttribute("aria-expanded", "false");
            currentMobileMenu.classList.add("hidden");
            currentMenuIcon.classList.remove("hidden");
            currentCloseIcon.classList.add("hidden");
            document.body.style.overflow = ''; // Restore scroll
        }
    };

    // Focus trap for mobile menu
    const trapFocus = (event: KeyboardEvent) => {
        const currentMobileMenu = document.getElementById("mobile-menu");
        if (!currentMobileMenu || currentMobileMenu.classList.contains("hidden")) return;

        const focusableElements = currentMobileMenu.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.key === 'Tab') {
            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }

        // Close menu on Escape
        if (event.key === 'Escape') {
            closeMobileMenu();
            const currentMenuButton = document.getElementById("mobile-menu-button");
            (currentMenuButton as HTMLElement)?.focus();
        }
    };

    if (menuButton && mobileMenu && menuIcon && closeIcon) {
        // Remove any existing listeners by cloning the node
        const newMenuButton = menuButton.cloneNode(true);
        menuButton.parentNode?.replaceChild(newMenuButton, menuButton);

        (newMenuButton as HTMLElement).addEventListener("click", () => {
            const currentMobileMenu = document.getElementById("mobile-menu");
            const currentMenuIcon = document.getElementById("menu-icon");
            const currentCloseIcon = document.getElementById("close-icon");
            
            const isExpanded = (newMenuButton as HTMLElement).getAttribute("aria-expanded") === "true";
            const willOpen = !isExpanded;
            
            (newMenuButton as HTMLElement).setAttribute("aria-expanded", willOpen.toString());
            currentMobileMenu?.classList.toggle("hidden");
            currentMenuIcon?.classList.toggle("hidden");
            currentCloseIcon?.classList.toggle("hidden");

            if (willOpen) {
                // Menu opening
                document.body.style.overflow = 'hidden'; // Prevent background scroll
                document.addEventListener('keydown', trapFocus);
                
                // Focus first interactive element
                setTimeout(() => {
                    const firstLink = currentMobileMenu?.querySelector<HTMLElement>('a, button');
                    firstLink?.focus();
                }, 100);
            } else {
                // Menu closing
                document.body.style.overflow = '';
                document.removeEventListener('keydown', trapFocus);
            }
        });
    }

    // Mobile submenu toggles
    const submenuButtons = document.querySelectorAll(".mobile-submenu-button");
    submenuButtons.forEach((button) => {
        // Remove any existing listeners by cloning the node
        const newButton = button.cloneNode(true);
        button.parentNode?.replaceChild(newButton, button);

        (newButton as HTMLElement).addEventListener("click", () => {
            const submenuName = (newButton as HTMLElement).getAttribute("data-submenu");
            const submenu = document.querySelector(
                `.mobile-submenu[data-submenu="${submenuName}"]`
            );
            const arrow = (newButton as HTMLElement).querySelector(".submenu-arrow");

            const isOpen = !submenu?.classList.contains("hidden");
            
            // Get all mobile menu links (both direct links and submenu buttons)
            const mobileMenuElement = document.getElementById("mobile-menu");
            const allMobileLinks = mobileMenuElement?.querySelectorAll('a:not(.mobile-submenu a)');
            const allSubmenuButtons = mobileMenuElement?.querySelectorAll('.mobile-submenu-button');
            
            submenu?.classList.toggle("hidden");
            arrow?.classList.toggle("rotate-180");
            
            // Toggle active state styling
            if (isOpen) {
                // Closing submenu
                (newButton as HTMLElement).classList.remove("text-primary-600", "bg-primary-50");
            } else {
                // Opening submenu - remove active styling from other items
                allMobileLinks?.forEach(link => {
                    link.classList.remove("text-primary-600", "bg-primary-50");
                    link.classList.add("text-neutral-900");
                });
                allSubmenuButtons?.forEach(btn => {
                    if (btn !== newButton) {
                        btn.classList.remove("text-primary-600", "bg-primary-50");
                        btn.classList.add("text-neutral-900");
                    }
                });
                
                // Add active styling to this button
                (newButton as HTMLElement).classList.remove("text-neutral-900");
                (newButton as HTMLElement).classList.add("text-primary-600", "bg-primary-50");
            }
        });
    });

    // Close mobile menu when clicking on a link
    const currentMobileMenu = document.getElementById("mobile-menu");
    const mobileLinks = currentMobileMenu?.querySelectorAll('a');
    mobileLinks?.forEach((link) => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });
}

// Initialize on page load (compatible with view transitions)
document.addEventListener('astro:page-load', () => {
    initNavSlider();
    initMobileMenu();
});
