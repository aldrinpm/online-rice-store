import React, { useEffect, useState } from "react";
import { supabase } from "../config/supabaseClient";

const ImageUploader = ({onUpload}) =>  {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    onUpload(imageUrl);
  };

  const uploadImage = async () => {
    if (!file) return alert("Please select a file first!");
    setUploading(true);

    // Generate unique filename
    const fileName = `${Date.now()}-${file.name}`;

    // Upload file to bucket
    const { data, error } = await supabase.storage
      .from("images")
      .upload(fileName, file);

    if (error) {
      console.error(error);
      alert("Upload failed");
      setUploading(false);
      return;
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from("images")
      .getPublicUrl(fileName);

    setImageUrl(publicData.publicUrl);
    alert("Upload successful!");
    setUploading(false);
  };

  useEffect(() => {
    if (imageUrl) {
      onUpload(imageUrl);
    }
  }, [imageUrl]);

  return (
    <div>
      <h2>Upload Image</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={uploadImage} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {imageUrl && (
        <div>
          <p>Uploaded Image:</p>
          <img src={imageUrl} alt="Uploaded" style={{ maxWidth: "300px" }} />
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
