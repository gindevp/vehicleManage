package com.hungpn.vehicle.repository.rowmapper;

import com.hungpn.vehicle.domain.Vehicle;
import io.r2dbc.spi.Row;
import java.time.LocalDate;
import java.util.function.BiFunction;
import org.springframework.stereotype.Service;

/**
 * Converter between {@link Row} to {@link Vehicle}, with proper type conversions.
 */
@Service
public class VehicleRowMapper implements BiFunction<Row, String, Vehicle> {

    private final ColumnConverter converter;

    public VehicleRowMapper(ColumnConverter converter) {
        this.converter = converter;
    }

    /**
     * Take a {@link Row} and a column prefix, and extract all the fields.
     * @return the {@link Vehicle} stored in the database.
     */
    @Override
    public Vehicle apply(Row row, String prefix) {
        Vehicle entity = new Vehicle();
        entity.setId(converter.fromRow(row, prefix + "_id", Long.class));
        entity.setName(converter.fromRow(row, prefix + "_name", String.class));
        entity.setType(converter.fromRow(row, prefix + "_type", Long.class));
        entity.setRegistrationDate(converter.fromRow(row, prefix + "_registration_date", LocalDate.class));
        entity.setPurchaseDate(converter.fromRow(row, prefix + "_purchase_date", LocalDate.class));
        return entity;
    }
}
