

export type UIElementType = 'text' | 'bar' | 'button' | 'panel' | 'image';

export interface UIElementStyle {
    color?: string;
    backgroundColor?: string;
    fontSize?: string;
    fontFamily?: string;
    padding?: string;
    borderRadius?: string;
    border?: string;
    opacity?: number;
    zIndex?: number;
}

export interface UIElementConfig {
    id: string;
    type: UIElementType;
    x: number;
    y: number;
    width?: number;
    height?: number;
    text?: string;
    value?: number;
    maxValue?: number;
    barColor?: string;
    barBgColor?: string;
    imageSrc?: string;
    style?: UIElementStyle;
    onClick?: () => void;
    visible?: boolean;
    anchor?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'center';
}

interface UIElement {
    config: UIElementConfig;
    element: HTMLElement;
}

export class UIManager {
    private static instance: UIManager | null = null;

    private container: HTMLDivElement | null = null;
    private elements: Map<string, UIElement> = new Map();
    private initialized = false;

    static getInstance(): UIManager {
        if (!UIManager.instance) {
            UIManager.instance = new UIManager();
        }
        return UIManager.instance;
    }

    initialize(parent: HTMLElement = document.body): void {
        if (this.initialized) return;

        this.container = document.createElement('div');
        this.container.id = 'vibe-ui-container';
        this.container.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 100;
            font-family: 'Segoe UI', system-ui, sans-serif;
        `;
        parent.appendChild(this.container);

        this.initialized = true;
        console.log('✅ UIManager initialized');
    }

    createText(id: string, text: string, x: number, y: number, style?: UIElementStyle): void {
        this.createElement({
            id,
            type: 'text',
            x,
            y,
            text,
            style
        });
    }

    createBar(
        id: string,
        x: number,
        y: number,
        width: number,
        height: number,
        value: number = 100,
        maxValue: number = 100,
        barColor: string = '#22c55e',
        barBgColor: string = '#374151'
    ): void {
        this.createElement({
            id,
            type: 'bar',
            x,
            y,
            width,
            height,
            value,
            maxValue,
            barColor,
            barBgColor
        });
    }

    createButton(
        id: string,
        text: string,
        x: number,
        y: number,
        onClick: () => void,
        style?: UIElementStyle
    ): void {
        this.createElement({
            id,
            type: 'button',
            x,
            y,
            text,
            onClick,
            style
        });
    }

    createPanel(
        id: string,
        x: number,
        y: number,
        width: number,
        height: number,
        style?: UIElementStyle
    ): void {
        this.createElement({
            id,
            type: 'panel',
            x,
            y,
            width,
            height,
            style
        });
    }

    createElement(config: UIElementConfig): void {
        if (!this.container) {
            console.warn('UIManager not initialized');
            return;
        }

        this.remove(config.id);

        const element = document.createElement('div');
        element.id = `vibe-ui-${config.id}`;

        element.style.position = 'absolute';
        element.style.left = `${config.x}px`;
        element.style.top = `${config.y}px`;

        this.applyAnchor(element, config);

        switch (config.type) {
            case 'text':
                this.setupText(element, config);
                break;
            case 'bar':
                this.setupBar(element, config);
                break;
            case 'button':
                this.setupButton(element, config);
                break;
            case 'panel':
                this.setupPanel(element, config);
                break;
        }

        if (config.style) {
            this.applyStyle(element, config.style);
        }

        if (config.visible === false) {
            element.style.display = 'none';
        }

        this.container.appendChild(element);
        this.elements.set(config.id, { config, element });
    }

    setText(id: string, text: string): void {
        const ui = this.elements.get(id);
        if (ui?.config.type === 'text') {
            ui.element.textContent = text;
            ui.config.text = text;
        }
    }

    setBarValue(id: string, value: number, maxValue?: number): void {
        const ui = this.elements.get(id);
        if (ui?.config.type === 'bar') {
            ui.config.value = value;
            if (maxValue !== undefined) ui.config.maxValue = maxValue;

            const fill = ui.element.querySelector('.bar-fill') as HTMLElement;
            if (fill) {
                const percent = Math.max(0, Math.min(100, (value / (ui.config.maxValue ?? 100)) * 100));
                fill.style.width = `${percent}%`;
            }
        }
    }

    show(id: string): void {
        const ui = this.elements.get(id);
        if (ui) {
            ui.element.style.display = 'block';
            ui.config.visible = true;
        }
    }

    hide(id: string): void {
        const ui = this.elements.get(id);
        if (ui) {
            ui.element.style.display = 'none';
            ui.config.visible = false;
        }
    }

    remove(id: string): void {
        const ui = this.elements.get(id);
        if (ui) {
            ui.element.remove();
            this.elements.delete(id);
        }
    }

    clear(): void {
        for (const [id] of this.elements) {
            this.remove(id);
        }
    }

    destroy(): void {
        this.clear();
        this.container?.remove();
        this.container = null;
        this.initialized = false;
        UIManager.instance = null;
    }

    private setupText(element: HTMLElement, config: UIElementConfig): void {
        element.textContent = config.text ?? '';
        element.style.color = config.style?.color ?? '#ffffff';
        element.style.fontSize = config.style?.fontSize ?? '16px';
        element.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
    }

    private setupBar(element: HTMLElement, config: UIElementConfig): void {
        element.style.width = `${config.width ?? 100}px`;
        element.style.height = `${config.height ?? 20}px`;
        element.style.backgroundColor = config.barBgColor ?? '#374151';
        element.style.borderRadius = '4px';
        element.style.overflow = 'hidden';
        element.style.border = '2px solid rgba(255,255,255,0.2)';

        const fill = document.createElement('div');
        fill.className = 'bar-fill';
        fill.style.height = '100%';
        fill.style.backgroundColor = config.barColor ?? '#22c55e';
        fill.style.transition = 'width 0.2s ease';

        const percent = ((config.value ?? 100) / (config.maxValue ?? 100)) * 100;
        fill.style.width = `${Math.max(0, Math.min(100, percent))}%`;

        element.appendChild(fill);
    }

    private setupButton(element: HTMLElement, config: UIElementConfig): void {
        element.textContent = config.text ?? 'Button';
        element.style.padding = config.style?.padding ?? '10px 20px';
        element.style.backgroundColor = config.style?.backgroundColor ?? '#6366f1';
        element.style.color = config.style?.color ?? '#ffffff';
        element.style.borderRadius = config.style?.borderRadius ?? '6px';
        element.style.border = 'none';
        element.style.cursor = 'pointer';
        element.style.pointerEvents = 'auto';
        element.style.transition = 'transform 0.1s, background-color 0.2s';

        element.addEventListener('mouseenter', () => {
            element.style.backgroundColor = '#4f46e5';
            element.style.transform = 'scale(1.05)';
        });
        element.addEventListener('mouseleave', () => {
            element.style.backgroundColor = config.style?.backgroundColor ?? '#6366f1';
            element.style.transform = 'scale(1)';
        });

        if (config.onClick) {
            element.addEventListener('click', config.onClick);
        }
    }

    private setupPanel(element: HTMLElement, config: UIElementConfig): void {
        element.style.width = `${config.width ?? 200}px`;
        element.style.height = `${config.height ?? 100}px`;
        element.style.backgroundColor = config.style?.backgroundColor ?? 'rgba(0,0,0,0.7)';
        element.style.borderRadius = config.style?.borderRadius ?? '8px';
        element.style.padding = config.style?.padding ?? '16px';
    }

    private applyStyle(element: HTMLElement, style: UIElementStyle): void {
        if (style.color) element.style.color = style.color;
        if (style.backgroundColor) element.style.backgroundColor = style.backgroundColor;
        if (style.fontSize) element.style.fontSize = style.fontSize;
        if (style.fontFamily) element.style.fontFamily = style.fontFamily;
        if (style.padding) element.style.padding = style.padding;
        if (style.borderRadius) element.style.borderRadius = style.borderRadius;
        if (style.border) element.style.border = style.border;
        if (style.opacity !== undefined) element.style.opacity = String(style.opacity);
        if (style.zIndex !== undefined) element.style.zIndex = String(style.zIndex);
    }

    private applyAnchor(element: HTMLElement, config: UIElementConfig): void {
        const anchor = config.anchor ?? 'topLeft';

        switch (anchor) {
            case 'topRight':
                element.style.left = 'auto';
                element.style.right = `${config.x}px`;
                break;
            case 'bottomLeft':
                element.style.top = 'auto';
                element.style.bottom = `${config.y}px`;
                break;
            case 'bottomRight':
                element.style.left = 'auto';
                element.style.right = `${config.x}px`;
                element.style.top = 'auto';
                element.style.bottom = `${config.y}px`;
                break;
            case 'center':
                element.style.left = '50%';
                element.style.top = '50%';
                element.style.transform = 'translate(-50%, -50%)';
                break;
        }
    }
}

export const ui = UIManager.getInstance();
