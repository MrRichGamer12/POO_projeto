export default class BadgeModel {

    constructor(name, description, key = null, category = "general", target = 1) {
        this.id = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        this.key = key || this.createKey(name);
        this.name = name;
        this.description = description;
        this.category = category;
        this.target = target;
        this.unlockedAt = new Date().toISOString();
    }

    createKey(name) {
        return String(name || "badge")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_|_$/g, "");
    }
}
