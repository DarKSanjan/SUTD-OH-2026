interface StudentInvolvement {
  club: string;
  role: string;
}

interface InvolvementDisplayProps {
  involvements: StudentInvolvement[];
  variant?: 'card' | 'list';
}

export default function InvolvementDisplay({ 
  involvements, 
  variant = 'list' 
}: InvolvementDisplayProps) {
  if (!involvements || involvements.length === 0) {
    return null;
  }

  return (
    <div className={`involvement-display ${variant}`}>
      <h3 className="involvement-title">Organization Involvements</h3>
      <div className="involvement-container">
        {involvements.map((involvement, index) => (
          <div key={index} className="involvement-item">
            <div className="involvement-club">{involvement.club}</div>
            <div className="involvement-role">{involvement.role}</div>
          </div>
        ))}
      </div>

      <style>{`
        .involvement-display {
          margin-top: 16px;
        }

        .involvement-title {
          color: #333;
          font-size: 16px;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .involvement-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .involvement-item {
          background: #f8f9fa;
          border-left: 4px solid #E63946;
          padding: 12px 16px;
          border-radius: 4px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .involvement-item:hover {
          transform: translateX(4px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .involvement-club {
          font-weight: 700;
          color: #333;
          font-size: 15px;
          margin-bottom: 4px;
        }

        .involvement-role {
          font-size: 13px;
          color: #666;
          font-weight: 500;
        }

        /* Card variant - more compact for admin view */
        .involvement-display.card .involvement-item {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-left: 3px solid #E63946;
          padding: 10px 14px;
        }

        .involvement-display.card .involvement-club {
          font-size: 14px;
        }

        .involvement-display.card .involvement-role {
          font-size: 12px;
        }

        /* List variant - more spacious for student view */
        .involvement-display.list .involvement-item {
          padding: 14px 18px;
        }

        .involvement-display.list .involvement-club {
          font-size: 16px;
        }

        .involvement-display.list .involvement-role {
          font-size: 14px;
        }

        /* Mobile optimizations */
        @media (max-width: 480px) {
          .involvement-title {
            font-size: 15px;
          }

          .involvement-item {
            padding: 10px 14px;
          }

          .involvement-club {
            font-size: 14px;
          }

          .involvement-role {
            font-size: 12px;
          }
        }

        /* Ensure good touch targets on mobile */
        @media (hover: none) and (pointer: coarse) {
          .involvement-item {
            min-height: 44px;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
