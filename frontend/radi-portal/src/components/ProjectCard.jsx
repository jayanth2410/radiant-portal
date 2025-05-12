import React from 'react';

const ProjectCard = ({ title, description, startDate, endDate, technologies, onDelete }) => {
  return (
    <div className="card bg-dark text-white position-relative" style={{ width: '18rem', padding: '1rem', borderRadius: '0.5rem' }}>
      
      {/* Delete Button */}
      <button
        type="button"
        className="btn-close btn-close-white position-absolute top-0 end-0 m-2"
        aria-label="Close"
        onClick={onDelete}
      ></button>

      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        <p className="card-text text-secondary" style={{ fontSize: '0.9rem' }}>
          {description}
        </p>
        <p className="card-text text-muted" style={{ fontSize: '0.8rem' }}>
          📅 {startDate} - {endDate}
        </p>
        <div className="d-flex gap-2 flex-wrap mt-2">
          {technologies.map((tech, index) => (
            <span key={index} className={`badge ${tech.colorClass}`}>
              {tech.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
