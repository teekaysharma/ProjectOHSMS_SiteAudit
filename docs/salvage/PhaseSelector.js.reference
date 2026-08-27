export default class PhaseSelector {
    constructor(containerId, activePhases) {
        this.container = document.getElementById(containerId);
        this.activePhases = activePhases;
        this.phases = [
            { id: 'site-prep', name: 'Site Preparation' },
            { id: 'civil-works', name: 'Civil Works' },
            { id: 'equipment-install', name: 'Equipment Installation' },
            { id: 'electrical-install', name: 'Electrical Installation' },
            { id: 'testing-comm', name: 'Testing & Commissioning' },
            { id: 'final-handover', name: 'Final Handover' }
        ];
        
        this.render();
        this.bindEvents();
    }

    render() {
        this.container.innerHTML = `
            <div class="phase-instructions">
                Select construction phases to show applicable sections
            </div>
            <div class="phase-selector">
                ${this.phases.map(phase => `
                    <div class="phase-item ${this.activePhases.has(phase.id) ? 'active' : ''}" 
                         id="phase-${phase.id}-item">
                        <input type="checkbox" id="phase-${phase.id}" 
                               ${this.activePhases.has(phase.id) ? 'checked' : ''}>
                        ${phase.name}
                    </div>
                `).join('')}
            </div>
        `;
    }

    bindEvents() {
        this.container.addEventListener('click', (e) => {
            const phaseItem = e.target.closest('.phase-item');
            if (!phaseItem) return;

            const checkbox = phaseItem.querySelector('input[type="checkbox"]');
            checkbox.checked = !checkbox.checked;
            
            const phaseId = checkbox.id.replace('phase-', '');
            if (checkbox.checked) {
                this.activePhases.add(phaseId);
            } else {
                this.activePhases.delete(phaseId);
            }
            
            phaseItem.classList.toggle('active');
            this.dispatchPhaseChangeEvent();
        });
    }

    dispatchPhaseChangeEvent() {
        const event = new CustomEvent('phaseChanged', {
            detail: new Set(this.activePhases)
        });
        document.dispatchEvent(event);
    }
}
