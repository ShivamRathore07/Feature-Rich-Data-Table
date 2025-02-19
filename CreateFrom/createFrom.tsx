"use client"
import React, { useState } from 'react';
import style from './createFrom.module.css'

interface EditState {
    edit: boolean;
    editData: Record<string, any>;
}

interface CreateFormProps {
    setFormToggle: React.Dispatch<React.SetStateAction<boolean>>;
    post: any;  
    put: any;
    isEdit: EditState;
    setIsEdit: React.Dispatch<React.SetStateAction<EditState>>;
}
const CreateFrom: React.FC<CreateFormProps> = ({ setFormToggle, post, put, isEdit, setIsEdit }) => {
    const [formData, setFormData] = useState({
        name: isEdit?.editData?.name || '',
        city: isEdit?.editData?.city || '',
        country: isEdit?.editData?.country || '',
        province: isEdit?.editData?.province || '',
        code: isEdit?.editData?.code || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isEdit.edit) {
            put(`/locations/${isEdit.editData.id}`, { ...formData, updatedAt: new Date().toISOString() });
        } else {
            post("/locations", { ...formData, updatedAt: new Date().toISOString() });
        }
        setFormToggle(false)
    };
    const handleCancle = () => {
        setFormToggle(false);
        setIsEdit({
            edit: false,
            editData: {},
        })
    }

    return (
        <div className={style["form-container"]}>
            <h2 className={style["h2"]}>Create Form</h2>
            <form onSubmit={handleSubmit} className={style["form"]}>
                <input className={style["input"]} type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
                <input className={style["input"]} type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
                <input className={style["input"]} type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange} required />
                <input className={style["input"]} type="text" name="province" placeholder="Province" value={formData.province} onChange={handleChange} required />
                <input className={style["input"]} type="text" name="code" placeholder="Code" value={formData.code} onChange={handleChange} required />
                <button className={style["button"]} type="submit">Submit</button>
                <button className={style["button-cancle"]} onClick={() => handleCancle()}>Cancle</button>
            </form>
        </div>
    );
}
export default CreateFrom
