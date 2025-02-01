import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import redisClient from '../utils/redis';
const dbClient = require('../utils/db');
const { ObjectId } = require('mongodb');
import Bull from 'bull';
const fileQueue = new Bull('fileQueue');


class FilesController {
    static async postUpload(req, res) {
        const token = req.headers['x-token'];
        const userId = await redisClient.get(`auth_${token}`);

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const {
            name, type, parentId = '0', isPublic = false, data,
        } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Missing name' });
        }

        if (!['folder', 'file', 'image'].includes(type)) {
            return res.status(400).json({ error: 'Invalid type' });
        }

        if (type !== 'folder' && !data) {
            return res.status(400).json({ error: 'Missing data' });
        }

        const parent = parentId !== '0'
            ? await dbClient.db.collection('files').findOne({ _id: ObjectId(parentId) })
            : null;

        if (parentId !== '0' && !parent) {
            return res.status(400).json({ error: 'Parent not found' });
        }

        if (parent && parent.type !== 'folder') {
            return res.status(400).json({ error: 'Parent is not a folder' });
        }

        const fileDocument = {
            userId: ObjectId(userId),
            name,
            type,
            isPublic,
            parentId,
        };

        if (type === 'folder') {
            const result = await dbClient.db.collection('files').insertOne(fileDocument);
            fileDocument._id = result.insertedId;
            return res.status(201).json({ id: fileDocument._id, ...fileDocument });
        }

        const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true, mode: 0o755 });
        }

        const localPath = path.join(folderPath, uuidv4());
        fs.writeFileSync(localPath, Buffer.from(data, 'base64'));

        fileDocument.localPath = localPath;
        const result = await dbClient.db.collection('files').insertOne(fileDocument);
        fileDocument._id = result.insertedId;

        return res.status(201).json({ id: fileDocument._id, ...fileDocument });
    }

    static async getShow(req, res) {
        const token = req.headers['x-token'];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userId = await redisClient.get(`auth_${token}`);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const fileId = req.params.id;
        if (!fileId) {
            return res.status(404).json({ error: 'Not found' });
        }

        const file = await dbClient.db
            .collection('files')
            .findOne({ _id: ObjectId(fileId), userId: ObjectId(userId) });

        if (!file) {
            return res.status(404).json({ error: 'Not found' });
        }

        const { _id, ...fileData } = file;
        return res.status(200).json({ id: _id, ...fileData });
    }

    static async getIndex(req, res) {
        const token = req.headers['x-token'];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userId = await redisClient.get(`auth_${token}`);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const parentId = req.query.parentId || '0';
        const page = Math.max(0, parseInt(req.query.page, 10) || 0);
        const pageSize = 20;
        const skip = page * pageSize;

        const files = await dbClient.db
            .collection('files')
            .aggregate([
                { $match: { parentId, userId: ObjectId(userId) } },
                { $skip: skip },
                { $limit: pageSize },
            ])
            .toArray();

        const formattedFiles = files.map((file) => {
            const { _id, ...fileData } = file;
            return { id: _id, ...fileData };
        });

        return res.status(200).json(formattedFiles);
    }
    static async putPublish(req, res) {
        const token = req.headers['x-token'];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userId = await redisClient.get(`auth_${token}`);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const fileId = req.params.id;
        if (!fileId) {
            return res.status(404).json({ error: 'Not found' });
        }

        const file = await dbClient.db
            .collection('files')
            .findOne({ _id: ObjectId(fileId), userId: ObjectId(userId) });

        if (!file) {
            return res.status(404).json({ error: 'Not found' });
        }

        await dbClient.db
            .collection('files')
            .updateOne({ _id: ObjectId(fileId) }, { $set: { isPublic: true } });

        const updatedFile = {
            id: file._id,
            userId: file.userId,
            name: file.name,
            type: file.type,
            isPublic: true,
            parentId: file.parentId,
        };

        return res.status(200).json(updatedFile);
    }

    static async putUnpublish(req, res) {
        const token = req.headers['x-token'];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userId = await redisClient.get(`auth_${token}`);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const fileId = req.params.id;
        if (!fileId) {
            return res.status(404).json({ error: 'Not found' });
        }

        const file = await dbClient.db
            .collection('files')
            .findOne({ _id: ObjectId(fileId), userId: ObjectId(userId) });

        if (!file) {
            return res.status(404).json({ error: 'Not found' });
        }

        await dbClient.db
            .collection('files')
            .updateOne({ _id: ObjectId(fileId) }, { $set: { isPublic: false } });

        const updatedFile = {
            id: file._id,
            userId: file.userId,
            name: file.name,
            type: file.type,
            isPublic: false,
            parentId: file.parentId,
        };

        return res.status(200).json(updatedFile);
    }
    static async postUpload(req, res) {
        if (file.type === 'image') {
            fileQueue.add({ userId: file.userId, fileId: fileId });
        }
        return res.status(201).json({
            id: fileId,
            userId: file.userId,
            name: file.name,
            type: file.type,
            isPublic: file.isPublic,
            parentId: file.parentId || null,
        });
    }
    static async getFile(req, res) {
        const { id: fileId } = req.params;
        const token = req.headers['x-token'];

        // Validate fileId
        if (!fileId || !ObjectId.isValid(fileId)) {
            return res.status(404).json({ error: 'Not found' });
        }

        // Fetch file document
        const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(fileId) });
        if (!file) {
            return res.status(404).json({ error: 'Not found' });
        }

        // Check if the file is a folder
        if (file.type === 'folder') {
            return res.status(400).json({ error: "A folder doesn't have content" });
        }

        // Validate access permissions
        const userId = token ? await redisClient.get(`auth_${token}`) : null;
        const isOwner = userId && String(file.userId) === String(userId);
        if (!file.isPublic && !isOwner) {
            return res.status(404).json({ error: 'Not found' });
        }

        // Check if the file exists locally
        if (!fs.existsSync(file.localPath)) {
            return res.status(404).json({ error: 'Not found' });
        }

        // Serve file content with appropriate MIME type
        const mimeType = mime.lookup(file.name) || 'application/octet-stream';
        res.setHeader('Content-Type', mimeType);
        const fileContent = fs.readFileSync(file.localPath);
        return res.status(200).send(fileContent);
    }
}

module.exports = FilesController;
