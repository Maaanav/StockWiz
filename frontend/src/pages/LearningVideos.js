import React, { useState, useEffect } from "react";
import "../styles/LearningVideos.css";

const LearningVideos = () => {
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/videos"); // Fetch from backend
        const data = await response.json();
        if (data.length > 0) {
          setVideos(data);
          setCurrentVideo(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching YouTube videos:", error);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="learning-videos-page">
      <h1 className="page-title"> Stock Market Learning Videos</h1>
      <p className="page-description">Watch tutorials to enhance your stock market knowledge.</p>

      {/* Video Player */}
      {currentVideo && (
        <div className="video-player">
          <iframe
            width="100%"
            height="450"
            src={`https://www.youtube.com/embed/${currentVideo}`}
            title="Stock Market Video"
            allowFullScreen
          ></iframe>
        </div>
      )}

      {/* Video Grid */}
      <div className="video-grid">
        {videos.map((video) => (
          <div
            key={video.id}
            className="video-card"
            onClick={() => setCurrentVideo(video.id)}
          >
            <img
              src={video.thumbnail}
              alt={video.title}
              className="video-thumbnail"
            />
            <div className="video-info">
              <h3>{video.title}</h3>
              <p>{video.description.length > 80 ? video.description.slice(0, 80) + "..." : video.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningVideos;
