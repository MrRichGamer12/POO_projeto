

export default class NoteModel {

    constructor(title, content) {
        this.id = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        this.title = title;
        this.content = content || "";
        this.createdAt = new Date().toISOString();
        this.updatedAt = this.createdAt;
    }

    
    static fromObject(data = {}) {
        const note = new NoteModel(data.title || "Nota sem título", data.content || "");
        Object.assign(note, data);
        note.createdAt = data.createdAt || note.createdAt;
        note.updatedAt = data.updatedAt || note.createdAt;
        return note;
    }

    
    update(title, content) {
        this.title = title || this.title;
        this.content = content || "";
        this.updatedAt = new Date().toISOString();
    }
}
