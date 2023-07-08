import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity()
export class Theme {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.themes)
    user: User

    @Column()
    primary: string;

    @Column()
    secondary: string;

    @Column()
    primButton: string;

    @Column()
    secButton: string;

    @Column()
    accent: string;
}
