import classNames from 'classnames';
import React from 'react';

interface Props {
    selectedValue: string;
    onChange: (newValue: string) => void;
    items: {
        text: string;
        value: string;
        disabled?: boolean;
    }[];
    className?: string;
}

export const CustomSwitch: React.FC<Props> = ({
    selectedValue,
    onChange,
    items,
    className,
}) => {
    const cssClass = classNames({
        'custom-switch': true,
        ...(className ? { [className]: true } : {}),
    });
    return (
        <div className={cssClass}>
            {items.map(({ text, value, disabled }) => {
                const cssClass = classNames({
                    'custom-switch__button': true,
                    'custom-switch__button--active': selectedValue === value,
                    'custom-switch__button--disabled': disabled,
                });
                return (
                    <button
                        key={value}
                        className={cssClass}
                        onClick={() => {
                            onChange(value);
                        }}
                        disabled={disabled}
                    >
                        {text}
                    </button>
                );
            })}
        </div>
    );
};
