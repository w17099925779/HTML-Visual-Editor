class XMLEditor {
    constructor() {
        this.editor = document.getElementById('xmlEditor');
        this.preview = document.getElementById('preview');
        this.fileInput = document.getElementById('fileInput');
        this.baseTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<root>
</root>`;
        this.initEventListeners();
        this.newFile();
    }

    initEventListeners() {
        document.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', e => {
                const action = e.target.dataset.action;
                this[action + 'File']();
            });
        });
        this.fileInput.addEventListener('change', e => this.handleFileSelect(e));
        this.editor.addEventListener('input', () => this.updatePreview());
    }

    newFile() {
        this.editor.value = this.baseTemplate;
        this.updatePreview();
    }

    openFile() {
        this.fileInput.click();
    }

    saveFile() {
        const content = this.editor.value;
        const blob = new Blob([content], { type: 'text/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.xml';
        a.click();
        URL.revokeObjectURL(url);
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => {
            this.editor.value = e.target.result;
            this.updatePreview();
        };
        reader.readAsText(file);
    }

    parseXML(xmlString) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "text/xml");
            if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
                throw new Error(xmlDoc.getElementsByTagName('parsererror')[0].textContent);
            }
            return xmlDoc.documentElement;
        } catch (error) {
            return { error: error.message };
        }
    }

    createTreeView(node, level = 0) {
        const div = document.createElement('div');
        div.className = 'xml-node';
        div.style.marginLeft = `${level * 20}px`;

        if (node.error) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error';
            errorDiv.textContent = node.error;
            return errorDiv;
        }

        const tagSpan = document.createElement('span');
        tagSpan.className = 'xml-tag';
        tagSpan.textContent = `<${node.nodeName}>`;
        div.appendChild(tagSpan);

        if (node.attributes && node.attributes.length > 0) {
            const attrDiv = document.createElement('div');
            Array.from(node.attributes).forEach(attr => {
                const attrSpan = document.createElement('span');
                attrSpan.className = 'xml-attr';
                attrSpan.textContent = `${attr.name}="${attr.value}"`;
                attrDiv.appendChild(attrSpan);
            });
            div.appendChild(attrDiv);
        }

        if (node.childNodes) {
            Array.from(node.childNodes).forEach(child => {
                if (child.nodeType === Node.ELEMENT_NODE) {
                    div.appendChild(this.createTreeView(child, level + 1));
                } else if (child.nodeType === Node.TEXT_NODE && child.textContent.trim()) {
                    const textDiv = document.createElement('div');
                    textDiv.className = 'xml-text';
                    textDiv.textContent = child.textContent.trim();
                    div.appendChild(textDiv);
                }
            });
        }

        return div;
    }

    updatePreview() {
        this.preview.innerHTML = '';
        const parsed = this.parseXML(this.editor.value);
        this.preview.appendChild(this.createTreeView(parsed));
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new XMLEditor();
});
