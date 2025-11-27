package com.hungpn.vehicle.service.mapper;

import com.hungpn.vehicle.domain.Vehicle;
import com.hungpn.vehicle.service.dto.VehicleDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Vehicle} and its DTO {@link VehicleDTO}.
 */
@Mapper(componentModel = "spring")
public interface VehicleMapper extends EntityMapper<VehicleDTO, Vehicle> {}
