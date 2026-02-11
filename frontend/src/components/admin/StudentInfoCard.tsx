import InvolvementDisplay from '../shared/InvolvementDisplay';

interface StudentInvolvement {
  club: string;
  role: string;
}

interface StudentData {
  studentId: string;
  name: string;
  tshirtSize: string;
  mealPreference: string;
  involvements?: StudentInvolvement[];
}

interface StudentInfoCardProps {
  student: StudentData;
}

export default function StudentInfoCard({ student }: StudentInfoCardProps) {
  return (
    <div className="student-info-card">
      <div className="card-header">
        <h2 className="student-name">{student.name}</h2>
        <span className="student-id">{student.studentId}</span>
      </div>

      <div className="card-body">
        <div className="info-row">
          <div className="info-label">T-Shirt Size</div>
          <div className="info-value">{student.tshirtSize}</div>
        </div>

        <div className="info-row">
          <div className="info-label">Meal Preference</div>
          <div className="info-value">{student.mealPreference}</div>
        </div>

        {student.involvements && student.involvements.length > 0 && (
          <div className="involvements-section">
            <InvolvementDisplay 
              involvements={student.involvements} 
              variant="card"
            />
          </div>
        )}
      </div>

      <style>{`
        .student-info-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
        }

        .card-header {
          background: #53001b;
          padding: 24px 20px;
          color: white;
        }

        .student-name {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 700;
          line-height: 1.2;
          word-break: break-word;
        }

        .student-id {
          display: inline-block;
          background: rgba(255, 255, 255, 0.2);
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .card-body {
          padding: 20px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid #e0e0e0;
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-label {
          font-size: 16px;
          font-weight: 600;
          color: #666;
        }

        .info-value {
          font-size: 18px;
          font-weight: 700;
          color: #333;
          text-align: right;
        }

        .involvements-section {
          margin-top: 8px;
          padding-top: 16px;
          border-top: 1px solid #e0e0e0;
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .student-info-card {
            border-radius: 8px;
          }

          .card-header {
            padding: 20px 16px;
          }

          .student-name {
            font-size: 22px;
          }

          .student-id {
            font-size: 13px;
            padding: 5px 10px;
          }

          .card-body {
            padding: 16px;
          }

          .info-row {
            padding: 14px 0;
          }

          .info-label {
            font-size: 15px;
          }

          .info-value {
            font-size: 17px;
          }
        }

        /* Small mobile devices */
        @media (max-width: 480px) {
          .card-header {
            padding: 18px 14px;
          }

          .student-name {
            font-size: 20px;
          }

          .student-id {
            font-size: 12px;
          }

          .card-body {
            padding: 14px;
          }

          .info-row {
            padding: 12px 0;
          }

          .info-label {
            font-size: 14px;
          }

          .info-value {
            font-size: 16px;
          }
        }

        /* Large touch targets for mobile */
        @media (hover: none) and (pointer: coarse) {
          .info-row {
            min-height: 44px;
          }
        }
      `}</style>
    </div>
  );
}
