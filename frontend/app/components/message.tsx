"use client";
import styles from './message.module.scss';
import {Fragment} from 'react';

interface MessageProps {
    title: string;
    subtitle: string;
}

export function Message({title, subtitle}: MessageProps) {
    return (
        <div className={styles.container}>
            <h3>{title}</h3>
            <p>{subtitle}</p>
        </div>
    )
}

export function ErrorMessage({subtitle = "Please try again later"}: {subtitle?: string}) {
    return (
        <Fragment>
            <Message title = {"Pokenet failed :("} subtitle={subtitle} />
        </Fragment>
    )
}