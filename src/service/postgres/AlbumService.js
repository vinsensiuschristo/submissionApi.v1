const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const { mapDBToModelAlbum } = require("../../utils");

class AlbumService {
    constructor() {
        this._pool = new Pool();
    }

    async addAlbum({ name, year }) {
        const id = nanoid(16);
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;

        const query = {
            text: "INSERT INTO musicapi VALUES($1, $2, $3, $4, $5) RETURNING id",
            values: [id, name, year, createdAt, updatedAt],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError("Album gagal ditambahkan");
        }

        return result.rows[0].id;
    }

    async getAlbumById(id) {
        const query = {
            text: "SELECT * FROM musicapi WHERE id = $1",
            values: [id],
        };
        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError("Catatan tidak ditemukan");
        }

        return result.rows.map(mapDBToModelAlbum)[0];
    }

    async editAlbumById(id, { name, year }) {
        const updatedAt = new Date().toISOString();
        const query = {
            text: "UPDATE musicapi SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id",
            values: [name, year, updatedAt, id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError(
                "Gagal memperbarui album. Id tidak ditemukan"
            );
        }
    }

    async deleteAlbumById(id) {
        const query = {
            text: "DELETE FROM musicapi WHERE id = $1 RETURNING id",
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError("Album gagal dihapus. Id tidak ditemukan");
        }
    }
}

module.exports = AlbumService;
