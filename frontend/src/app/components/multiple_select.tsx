import * as React from 'react';
import {Theme, useTheme} from '@mui/material/styles';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import FormHelperText from '@mui/material/FormHelperText';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 4;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 5 + ITEM_PADDING_TOP,
            width: 150,
        },
    },
};

const names = [
    'Nike',
    'Adidas',
];

function getStyles(name: string, personName: readonly string[], theme: Theme) {
    return {
        fontWeight: personName.includes(name)
            ? theme.typography.fontWeightMedium
            : theme.typography.fontWeightRegular,
    };
}

export default function MultipleSelectComponent({onChange}: {
    onChange: (selected: string[]) => void
}) {
    const theme = useTheme();
    const [personName, setPersonName] = React.useState<string[]>(['Nike', 'Adidas']);
    const [error, setError] = React.useState(false);

    const handleChange = (event: SelectChangeEvent<typeof personName>) => {
        const {target: {value}} = event;
        const selected = typeof value === 'string' ? value.split(',') : value;

        setPersonName(selected);
        setError(selected.length === 0);
        onChange(selected); // Pass selected items to parent component
    };

    return (
        <FormControl sx={{m: 1, width: 200}} error={error}>
            <InputLabel id="demo-multiple-chip-label">Scrape from</InputLabel>
            <Select
                labelId="demo-multiple-chip-label"
                id="demo-multiple-chip"
                multiple
                value={personName}
                onChange={handleChange}
                input={<OutlinedInput id="select-multiple-chip"
                                      label="Scrape from" required/>}
                renderValue={(selected) => (
                    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                        {selected.map((value) => (
                            <Chip key={value} label={value}/>
                        ))}
                    </Box>
                )}
                MenuProps={MenuProps}
            >
                {names.map((name) => (
                    <MenuItem
                        key={name}
                        value={name}
                        style={getStyles(name, personName, theme)}
                    >
                        {name}
                    </MenuItem>
                ))}
            </Select>
            {error &&
                <FormHelperText>Select at least one source</FormHelperText>}
        </FormControl>
    );
}
