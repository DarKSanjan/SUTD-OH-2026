export interface Claim {
  id?: number;
  studentId: string;
  tshirtClaimed: boolean;
  mealClaimed: boolean;
  tshirtClaimedAt?: Date;
  mealClaimedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
