import React, { useState, useEffect } from 'react'
import { Table, message } from 'antd';
import axios from 'axios';

interface IFile {
    url: String,
    name: String,
    mimetype: String,
    encoding: String,
    size: Number
}

const fileColumns = [
    {
        title: 'Url',
        dataIndex: 'url',
    }, 
    {
        title: 'Name',
        dataIndex: 'name'
    }, 
    {
        title: 'Type',
        dataIndex: 'mimetype'
    }, 
    {
        title: 'Encoding',
        dataIndex: 'encoding'
    }
]

const FileUpload = () => {

    const [file, setFile] = useState<File | undefined>();
    const [fileName, setFileName] = useState<string>("");
    const [shortUrl, setShortUrl] = useState<string>("")
    const [files, setFiles] = useState<IFile[]>([])

    const saveFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setFileName(e.target.files[0].name);
        }
    };

    const uploadFile = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        
        if (!file) {
            message.error({
                content: <span>No File Selected</span>
            })
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileName", fileName);

        try {
            const res = await axios.post(`${process.env.REACT_APP_BASE_URL}/upload`, formData);
            const { data } = res
            setShortUrl(data.shortUrl)
            getFiles()
        } catch (err: any) {
            message.error({
                content: <span>File with this name already exists! Choose a file with different name</span>
            })
        }
    };

    const getFiles = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/files`)
            const { data } = res
            setFiles(data.files)
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        getFiles()
    }, [])

    return (
        <div className="App">
            <input type="file" onChange={saveFile} />
            <button onClick={uploadFile}>Upload</button>
            <h1>Files</h1>
            <Table
                columns={fileColumns}
                dataSource={files}
            />
        </div>
    );

}

export default FileUpload;